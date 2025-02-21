from flask import request, jsonify
from src.services.trainingService import training_loop, get_model_weights, calculate_grids, reset_training_flags
from src.socketio_instance import socketio  # Import the socketio instance
import threading
from src.training_events import stop_training_event, pause_training_event

# Global variables to manage the training thread and stop flag
training_thread = None

def start_training():
    global training_thread
    data = request.get_json()
    print("Received training configuration:", data)
    
    # If a training session is already running, return an error
    if training_thread is not None and training_thread.is_alive():
        print("Training is already running.")
        return jsonify({"message": "Training is already running."}), 400

    # Reset the training flags and start a new training thread with the provided config
    reset_training_flags()
    training_thread = threading.Thread(target=training_loop, args=(data,))
    training_thread.start()
    print("Training thread started.")

    return jsonify({
        "message": f"Training started with configuration: {data}"
    })

def stop():
    print("Stop signal received.")
    stop_training_event.set()
    print("[DEBUG] Stop event set.")
    return jsonify({"message": "Stop signal received."})

def pause():
    print("Pause signal received.")
    pause_training_event.set()
    print("[DEBUG] Pause event set.")
    socketio.emit('training_update', {'message': 'Waiting for epoch to finish...'})
    return jsonify({"message": "Pause signal received. Waiting for epoch to finish..."})

def resume():
    print("Resume signal received.")
    pause_training_event.clear()
    print("[DEBUG] Pause event cleared.")
    socketio.emit('training_update', {'message': 'Training resumed.'})
    return jsonify({"message": "Resume signal received."})

def get_weights():
    global model
    weights = get_model_weights(model)
    return jsonify(weights)

def calculate_grids_endpoint():
    data = request.json
    weights = data['weights']
    
    initial_grids, layer_grids = calculate_grids(weights)
    
    return jsonify({'initial_grids': initial_grids, 'layer_grids': layer_grids})