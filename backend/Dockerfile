FROM python:3.9-slim

WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set the PYTHONPATH and FLASK_APP environment variables
ENV PYTHONPATH=/app/src
ENV FLASK_APP=src.app

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["flask", "run", "--host=0.0.0.0"]
