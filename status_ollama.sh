#!/bin/bash
echo "📊 Ollama Service Status"
echo "======================="

if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Status: Running"
    echo "🌐 URL: http://localhost:11434"
    echo ""
    echo "📋 Installed Models:"
    ollama list
else
    echo "❌ Status: Not Running"
    echo ""
    echo "To start Ollama, run:"
    echo "  ./start_ollama.sh"
fi
