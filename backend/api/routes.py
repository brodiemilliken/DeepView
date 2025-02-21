from flask import Blueprint, jsonify, request
from utils.logger import logger

api = Blueprint("api", __name__)

@api.route("/", methods=["GET"])
def home():
    return jsonify({"message": "DeepView Backend Running!"})

@api.route("/train", methods=["POST"])
def start_training():
    # Expecting a JSON payload with hyperparameters from the front end
    hyperparams = request.get_json()

    logger.info(f"Received hyperparameters: {hyperparams}")
    logger.info("Starting training...")

    if not hyperparams:
        return jsonify({"error": "No hyperparameters provided"}), 400

    # TODO: Start the NN training using these hyperparameters.
    return jsonify({
        "message": "Training started.",
        "hyperparameters": hyperparams
    })

@api.route("/pause", methods=["POST"])
def pause_training():
    logger.info("Pausing Training...")

    # TODO: Implement pause training logic.
    return jsonify({"message": "Pausing Training..."})

@api.route("/resume", methods=["POST"])
def resume_training():
    logger.info("Resuming Training...")

    # TODO: Implement resume training logic.
    return jsonify({"message": "Resuming Training..."})

@api.route("/stop", methods=["POST"])
def stop_training():
    logger.info("Stopping Training...")
    # TODO: Implement stop training logic.
    return jsonify({"message": "Stopping Training..."})

@api.route("/visualize", methods=["POST"])
def neuron_visualization():
    viz_params = request.get_json()

    logger.info(f"Received visualization parameters: {viz_params}")
    logger.info("Processing visualization request...")  

    if not viz_params:
        return jsonify({"error": "No visualization parameters provided"}), 400

    # TODO: Process the visualization request, e.g., generate or fetch the visualization data.
    return jsonify({
        "message": "Processing visualization request...",
        "parameters": viz_params
    })

def setup_routes(app):
    app.register_blueprint(api, url_prefix="/api")
