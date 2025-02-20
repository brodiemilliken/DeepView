import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import torch
import torch.optim as optim
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Import our dynamic neural network model
from nn_model import DynamicNet

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
socketio = SocketIO(app, cors_allowed_origins="*")

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
        # Get the layer configuration from the incoming data.
        layer_sizes = config.get('layers', [128, 64])
        
        # Create an instance of the dynamic network.
        model = DynamicNet(layer_sizes, input_dim=784, output_dim=10)
        
        # Send initial weights
        initial_weights = get_model_weights(model)
        socketio.emit('training_update', {'epoch': 0, 'weights': initial_weights})
        
        # Set up the optimizer and loss function.
        optimizer = optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()
        
        epoch = 0
        # Training loop: train on the MNIST dataset.
        while not stop_training:
            batch_number = 0
            epoch_loss = 0
            num_batches = 0
            for inputs, labels in train_loader:
                if stop_training:
                    break
                
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
            
            # Calculate average training error for the epoch
            avg_epoch_loss = epoch_loss / num_batches if num_batches > 0 else 0
            socketio.emit('training_update', {'epoch': epoch, 'avg_error': round(avg_epoch_loss, 4)})
            
            # Send weights at the end of each epoch
            weights = get_model_weights(model)
            socketio.emit('training_update', {'epoch': epoch, 'weights': weights})
            epoch += 1

            # Check if training should be paused
            if pause_training:
                socketio.emit('training_update', {'message': 'Waiting for epoch to finish...'})
                while pause_training and not stop_training:
                    time.sleep(1)
                if not stop_training:
                    socketio.emit('training_update', {'message': 'Training paused.'})

        socketio.emit('training_update', {'message': 'Training stopped.'})
        stop_training = False
        pause_training = False
    except Exception as e:
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

if __name__ == '__main__':
    # Use allow_unsafe_werkzeug=True for development purposes
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
