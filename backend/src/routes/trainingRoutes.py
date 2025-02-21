from flask import Blueprint
from src.controllers.trainingController import start_training, stop, pause, resume, get_weights, calculate_grids_endpoint

training_bp = Blueprint('training', __name__)

training_bp.route('/train', methods=['POST'])(start_training)
training_bp.route('/stop', methods=['POST'])(stop)
training_bp.route('/pause', methods=['POST'])(pause)
training_bp.route('/resume', methods=['POST'])(resume)
training_bp.route('/get_weights', methods=['GET'])(get_weights)
training_bp.route('/calculate_grids', methods=['POST'])(calculate_grids_endpoint)