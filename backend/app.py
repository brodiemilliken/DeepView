import os
import debugpy
from flask import Flask
from flask_cors import CORS
from api.routes import setup_routes
from utils.logger import logger

# Only start the debugger in the reloader's main process
if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    debugpy.listen(("0.0.0.0", 5678))
    print("⚡ Debugger listening on port 5678...")

app = Flask(__name__)
CORS(app)
setup_routes(app)

logger.info("DeepView Flask Server Starting...")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
