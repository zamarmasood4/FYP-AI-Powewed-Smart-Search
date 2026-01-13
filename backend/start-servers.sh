#!/bin/bash

echo "Starting AI-Powered Smart Search & Recommendation System Backend Servers"
echo

echo "Starting Express Server (Port 3000)..."
cd express-server
npm run dev &
EXPRESS_PID=$!

echo "Waiting 3 seconds before starting Flask Server..."
sleep 3

echo "Starting Flask Server (Port 5000)..."
cd ../flask-server
python app.py &
FLASK_PID=$!

echo
echo "Both servers are starting..."
echo "Express Server: http://localhost:3000"
echo "Flask Server: http://localhost:5000"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $EXPRESS_PID 2>/dev/null
    kill $FLASK_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
