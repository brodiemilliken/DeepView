import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import emit
import threading
import torch
import torch.optim as optim
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Import our dynamic neural network model
from src.models.nn_model import DynamicNet
from src.utils.GridCalculator import calculate_initial_grids, calculate_layer_grids
from src.routes.trainingRoutes import training_bp
from src.socketio_instance import socketio  # Import the socketio instance

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
socketio.init_app(app)  # Initialize the socketio instance with the app

# Register blueprints
app.register_blueprint(training_bp)

# Global variables to manage the training thread and stop flag
training_thread = None
stop_training = False
pause_training = False
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

@app.route('/get_weights', methods=['GET'])
def get_weights():
    global model
    weights = get_model_weights(model)
    return jsonify(weights)

def training_loop(config):
    global stop_training, pause_training, model
    try:
        layer_sizes = config.get('layers', [128, 64])
        print("[DEBUG] Training configuration received:", config)
        print("[DEBUG] Creating model with layers:", layer_sizes)
        
        model = DynamicNet(layer_sizes, input_dim=784, output_dim=10)
        
        initial_weights = get_model_weights(model)
        initial_grids = calculate_initial_grids(initial_weights)
        layer_grids = calculate_layer_grids(initial_weights)
        print("[DEBUG] Initial weights and grids computed.")
        socketio.emit('training_update', {'epoch': 0, 'weights': initial_weights, 'initial_grids': initial_grids, 'layer_grids': layer_grids})
        
        optimizer = optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()
        
        epoch = 0
        while not stop_training:
            batch_number = 0
            epoch_loss = 0
            num_batches = 0

            for inputs, labels in train_loader:
                if stop_training:
                    print(f"[DEBUG] Stop flag detected at epoch {epoch}, batch {batch_number}. Exiting batch loop.")
                    break

                # Training step
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

            if stop_training:
                print(f"[DEBUG] Stop flag detected after epoch {epoch} batch loop. Exiting training loop.")
                break

            avg_epoch_loss = epoch_loss / num_batches if num_batches > 0 else 0
            print(f"[DEBUG] Completed epoch {epoch} with average error {avg_epoch_loss}.")
            socketio.emit('training_update', {'epoch': epoch, 'avg_error': round(avg_epoch_loss, 4)})
            
            weights = get_model_weights(model)
            initial_grids = calculate_initial_grids(weights)
            layer_grids = calculate_layer_grids(weights)
            print(f"[DEBUG] Emitting updated weights and grids for epoch {epoch}.")
            socketio.emit('training_update', {'epoch': epoch, 'weights': weights, 'initial_grids': initial_grids, 'layer_grids': layer_grids})
            
            epoch += 1

            if pause_training:
                print(f"[DEBUG] Pause flag detected at epoch {epoch}. Pausing training.")
                socketio.emit('training_update', {'message': 'Waiting for epoch to finish...'})
                while pause_training and not stop_training:
                    print(f"[DEBUG] Training paused at epoch {epoch}. Waiting to resume...")
                    time.sleep(1)
                if not stop_training:
                    print(f"[DEBUG] Pause flag cleared. Resuming epoch {epoch}.")
                    socketio.emit('training_update', {'message': 'Training resumed.'})

        print("[DEBUG] Training loop ended due to stop flag or finished training.")
        socketio.emit('training_update', {'message': 'Training stopped.'})
        stop_training = False
        pause_training = False

    except Exception as e:
        print(f"[ERROR] Exception in training loop: {str(e)}")
        socketio.emit('training_update', {'message': f'Error: {str(e)}'})
        stop_training = False
        pause_training = False

@app.route('/train', methods=['POST'])
def start_training():
    global training_thread, stop_training, pause_training, model
    data = request.get_json()
    print("Received training configuration:", data)
    
    # If a training session is already running, return an error
    if training_thread is not None and training_thread.is_alive():
        return jsonify({"message": "Training is already running."}), 400

    # Reset the stop and pause flags and start a new training thread with the provided config
    stop_training = False
    pause_training = False
    training_thread = threading.Thread(target=training_loop, args=(data,))
    training_thread.start()

    return jsonify({
        "message": f"Training started with configuration: {data}"
    })

@app.route('/stop', methods=['POST'])
def stop():
    global stop_training
    # Set the flag to signal the training loop to stop
    stop_training = True
    return jsonify({"message": "Stop signal received."})

@app.route('/pause', methods=['POST'])
def pause():
    global pause_training
    # Set the flag to signal the training loop to pause
    pause_training = True
    socketio.emit('training_update', {'message': 'Waiting for epoch to finish...'})
    return jsonify({"message": "Pause signal received. Waiting for epoch to finish..."})

@app.route('/resume', methods=['POST'])
def resume():
    global pause_training
    # Clear the flag to signal the training loop to resume
    pause_training = False
    socketio.emit('training_update', {'message': 'Training resumed.'})
    return jsonify({"message": "Resume signal received."})

@app.route('/calculate_grids', methods=['POST'])
def calculate_grids():
    data = request.json
    weights = data['weights']
    
    initial_grids = calculate_initial_grids(weights)
    layer_grids = calculate_layer_grids(weights, initial_grids)
    
    return jsonify({'initial_grids': initial_grids, 'layer_grids': layer_grids})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
