import time
import torch
import torch.optim as optim
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from src.models.nn_model import DynamicNet
from src.utils.GridCalculator import calculate_grids
from src.socketio_instance import socketio  # Import the socketio instance
import threading
from src.training_events import stop_training_event, pause_training_event

# Global variables to manage the training thread and stop flag
model = None

# Load the MNIST dataset
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
train_dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

def get_model_weights(model):
    weights = []
    for layer in model.layers:
        if isinstance(layer, nn.Linear):
            weights.append(layer.weight.data.cpu().numpy().tolist())
    return weights

def training_loop(config):
    global model
    try:
        layer_sizes = config.get('layers', [128, 64])
        model = DynamicNet(layer_sizes, input_dim=784, output_dim=10)
        
        # Send initial weights and grids
        initial_weights = get_model_weights(model)
        initial_grids, layer_grids = calculate_grids(initial_weights)
        socketio.emit('training_update', {'epoch': 0, 'weights': initial_weights, 'initial_grids': initial_grids, 'layer_grids': layer_grids})
        print("[DEBUG] Training started with network architecture:", layer_sizes)

        optimizer = optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()

        epoch = 0
        while not stop_training_event.is_set():
            print(f"[DEBUG] Starting epoch {epoch}")
            batch_number = 0
            epoch_loss = 0
            num_batches = 0
            for inputs, labels in train_loader:
                # Check for stop event
                if stop_training_event.is_set():
                    print("[DEBUG] Stop event detected inside batch loop.")
                    break

                # Check for pause event
                if pause_training_event.is_set():
                    print("[DEBUG] Pause event detected inside batch loop. Pausing training.")
                    socketio.emit('training_update', {'message': 'Training is paused...'})
                    while pause_training_event.is_set() and not stop_training_event.is_set():
                        print("[DEBUG] Training is currently paused...")
                        time.sleep(0.5)
                    print("[DEBUG] Pause event cleared, resuming training.")
                    socketio.emit('training_update', {'message': 'Training resumed.'})

                # Perform training step
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                training_error = loss.item()
                epoch_loss += training_error
                num_batches += 1
                socketio.emit('training_update', {'batch': batch_number})
                batch_number += 1

            if stop_training_event.is_set():
                print("[DEBUG] Stop event detected after batch loop. Exiting epoch loop.")
                break

            avg_epoch_loss = epoch_loss / num_batches if num_batches > 0 else 0
            print(f"[DEBUG] Completed epoch {epoch} with average error {avg_epoch_loss}")
            socketio.emit('training_update', {'epoch': epoch, 'avg_error': round(avg_epoch_loss, 4)})
            # (Recalculate weights and grids, then emit updates)
            epoch += 1

            # Check pause at epoch boundary just in case
            if pause_training_event.is_set():
                print(f"[DEBUG] Pause event detected at end of epoch {epoch}.")
                socketio.emit('training_update', {'message': 'Waiting for resume at epoch end...'})
                while pause_training_event.is_set() and not stop_training_event.is_set():
                    print("[DEBUG] Waiting in pause loop after epoch...")
                    time.sleep(0.5)
                print("[DEBUG] Exiting pause loop after epoch.")
                socketio.emit('training_update', {'message': 'Training resumed after pause.'})

        print("[DEBUG] Training loop ended due to stop event.")
        socketio.emit('training_update', {'message': 'Training stopped.'})
        stop_training_event.clear()
        pause_training_event.clear()
    except Exception as e:
        print(f"[ERROR] Exception in training loop: {str(e)}")
        socketio.emit('training_update', {'message': f'Error: {str(e)}'})
        stop_training_event.clear()
        pause_training_event.clear()

def reset_training_flags():
    stop_training_event.clear()
    pause_training_event.clear()