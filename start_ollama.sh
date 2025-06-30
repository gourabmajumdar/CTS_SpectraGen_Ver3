#!/bin/bash
echo "🚀 Starting Ollama service..."

# Check if already running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is already running"
    exit 0
fi

# Start service
if [[ "$OSTYPE" == "darwin"* ]] && command -v brew &> /dev/null; then
    brew services start ollama
else
    nohup ollama serve > ollama.log 2>&1 &
    echo $! > ollama.pid
fi

# Wait for startup
echo "⏳ Waiting for service to start..."
for i in {1..15}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is running on http://localhost:11434"
        exit 0
    fi
    sleep 2
done

echo "❌ Failed to start Ollama"
exit 1
