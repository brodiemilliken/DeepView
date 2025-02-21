import logging
import sys

def setup_logger():
    logger = logging.getLogger("DeepViewLogger")
    logger.setLevel(logging.DEBUG)  # Capture all logs (DEBUG, INFO, WARNING, ERROR)

    # Console handler to print logs in real-time
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # Log format
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] - %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)

    # Avoid duplicate log handlers
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger

# Initialize logger
logger = setup_logger()
