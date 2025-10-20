#!/bin/bash

# Start backend in background
cd /home/runner/workspace/backend
python main.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Start frontend
cd /home/runner/workspace/frontend
npm run dev

# Cleanup
kill $BACKEND_PID 2>/dev/null
