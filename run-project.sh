#!/bin/bash

# SPAM BUSTER - ALL-IN-ONE LAUNCHER (Mac/Linux)

echo "=========================================="
echo "   SPAM BUSTER - ALL-IN-ONE LAUNCHER"
echo "=========================================="

# 1. Install Redis if missing
if ! command -v redis-server &> /dev/null; then
    echo "[!] Redis not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
    else
        sudo apt-get update && sudo apt-get install -y redis-server
    fi
fi

# 2. Start Redis
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start redis
else
    sudo systemctl start redis-server
fi

# 3. Setup .env & dependencies
if [ ! -f "server/.env" ]; then copy server/.env.example server/.env; fi
if [ ! -d "server/node_modules" ]; then
    echo "[!] Installing dependencies..."
    (cd server && npm install)
    (cd client && npm install)
fi

# 4. Run
echo "[OK] Launching Services..."
npx concurrently "cd server && npm run dev" "cd client && npm run dev"
