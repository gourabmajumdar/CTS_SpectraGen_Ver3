#!/bin/bash
echo "🛑 Stopping Ollama service..."

if [[ "$OSTYPE" == "darwin"* ]] && command -v brew &> /dev/null; then
    brew services stop ollama
else
    if [ -f ollama.pid ]; then
        PID=$(cat ollama.pid)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            rm ollama.pid
            echo "✅ Ollama stopped"
        else
            echo "⚠️  Ollama was not running"
            rm ollama.pid
        fi
    else
        pkill -f "ollama serve" || echo "⚠️  No Ollama process found"
    fi
fi
