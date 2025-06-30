# Ollama Setup for Auto Test Generation Tool

## Quick Start

1. **Setup (one-time)**:
   ```bash
   chmod +x setup_ollama.sh
   ./setup_ollama.sh
   ```

2. **Start Ollama**:
   ```bash
   ./start_ollama.sh
   ```

3. **Check Status**:
   ```bash
   ./status_ollama.sh
   ```

4. **Stop Ollama**:
   ```bash
   ./stop_ollama.sh
   ```

## Manual Commands

- **Check if running**: `curl http://localhost:11434/api/tags`
- **List models**: `ollama list`
- **Pull new model**: `ollama pull <model-name>`
- **Remove model**: `ollama rm <model-name>`

## Troubleshooting

### Service Won't Start
```bash
# Kill any existing processes
pkill -f "ollama serve"

# Start manually
ollama serve
```

### Model Download Issues
```bash
# Check available models
ollama pull --help

# Pull specific model
ollama pull codellama:7b
```

### Port Issues
If port 11434 is in use:
```bash
# Check what's using the port
lsof -i :11434

# Or start on different port
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

## Configuration

Edit `.env` file to customize:
- `OLLAMA_URL`: Ollama service URL
- `OLLAMA_MODEL`: Default model name
- `AI_BACKEND`: Backend selection (auto/ollama/llama2)

## Models Used

- **codellama:7b**: Primary model for code generation
- Size: ~3.8GB
- Purpose: Code generation and basic instruction following

## System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 5GB free space for models
- **OS**: Linux, macOS, or Windows (WSL)
