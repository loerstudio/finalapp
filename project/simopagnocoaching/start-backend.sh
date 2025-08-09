#!/bin/bash

echo "Starting SimoPagno Coaching Backend Server..."
echo "Make sure you have Python and pip installed"

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment and installing dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Start the server
echo "Starting server on http://localhost:8082"
python app.py 