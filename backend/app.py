from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (for development)

@app.route('/train', methods=['POST'])
def train():
    data = request.get_json()
    # For now, just print the configuration and respond with a dummy message
    print("Received training configuration:", data)
    return jsonify({
        "message": f"Configuration received. Starting training with configuration: {data}"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
