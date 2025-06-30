#!/bin/bash

echo "🚀 Setting up Ollama for Auto Test Generation Tool..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if script is run with proper permissions
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "This script should not be run as root (except for package installation)"
    fi
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_status "Detected OS: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_status "Detected OS: macOS"
    else
        print_error "Unsupported OS: $OSTYPE"
        exit 1
    fi
}

# Install Ollama
install_ollama() {
    print_status "Installing Ollama..."

    if command -v ollama &> /dev/null; then
        print_success "Ollama is already installed"
        ollama --version
        return 0
    fi

    if [[ "$OS" == "macos" ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            print_status "Installing Ollama via Homebrew..."
            brew install ollama
        else
            print_status "Installing Ollama via curl..."
            curl -fsSL https://ollama.ai/install.sh | sh
        fi
    else
        # Linux installation
        print_status "Installing Ollama via curl..."
        curl -fsSL https://ollama.ai/install.sh | sh
    fi

    if command -v ollama &> /dev/null; then
        print_success "Ollama installed successfully"
        ollama --version
    else
        print_error "Failed to install Ollama"
        exit 1
    fi
}

# Start Ollama service
start_ollama() {
    print_status "Starting Ollama service..."

    # Check if Ollama is already running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama service is already running"
        return 0
    fi

    # Start Ollama in background
    if [[ "$OS" == "macos" ]]; then
        # macOS - use brew services if available
        if command -v brew &> /dev/null; then
            brew services start ollama 2>/dev/null || {
                print_status "Starting Ollama manually..."
                nohup ollama serve > ollama.log 2>&1 &
                echo $! > ollama.pid
            }
        else
            nohup ollama serve > ollama.log 2>&1 &
            echo $! > ollama.pid
        fi
    else
        # Linux - try systemd first, then manual
        if systemctl --user start ollama 2>/dev/null; then
            print_status "Started Ollama via systemd"
        else
            print_status "Starting Ollama manually..."
            nohup ollama serve > ollama.log 2>&1 &
            echo $! > ollama.pid
        fi
    fi

    # Wait for service to start
    print_status "Waiting for Ollama service to start..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_success "Ollama service is running on http://localhost:11434"
            return 0
        fi
        sleep 2
        echo -n "."
    done

    print_error "Failed to start Ollama service"
    exit 1
}

# Pull required models
pull_models() {
    print_status "Pulling required AI models..."

    # Model required by current implementation
    REQUIRED_MODEL="codellama:7b"

    print_status "Pulling model: $REQUIRED_MODEL"
    if ollama pull "$REQUIRED_MODEL"; then
        print_success "Successfully pulled $REQUIRED_MODEL"
    else
        print_error "Failed to pull $REQUIRED_MODEL"
        exit 1
    fi

    # Verify model is available
    print_status "Verifying installed models..."
    ollama list
}

# Create environment configuration
create_env_config() {
    print_status "Creating environment configuration..."

    cat > .env << 'ENV_EOF'
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=codellama:7b

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true

# Auto Test Generation Tool Configuration
AI_BACKEND=auto
LOG_LEVEL=INFO

# Fallback Configuration
ENABLE_FALLBACK=true
ENV_EOF

    print_success "Created .env configuration file"
}

# Create start/stop scripts
create_control_scripts() {
    print_status "Creating control scripts..."

    # Create start script
    cat > start_ollama.sh << 'START_EOF'
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
START_EOF

    # Create stop script
    cat > stop_ollama.sh << 'STOP_EOF'
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
STOP_EOF

    # Create status script
    cat > status_ollama.sh << 'STATUS_EOF'
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
STATUS_EOF

    chmod +x start_ollama.sh stop_ollama.sh status_ollama.sh
    print_success "Created control scripts: start_ollama.sh, stop_ollama.sh, status_ollama.sh"
}

# Create README
create_readme() {
    print_status "Creating README..."

    cat > OLLAMA_README.md << 'README_EOF'
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
README_EOF

    print_success "Created OLLAMA_README.md"
}

# Main execution
main() {
    echo "🚀 CTS SpectraGen Tool - Ollama Setup"
    echo "==========================================="

    check_permissions
    detect_os
    install_ollama
    start_ollama
    pull_models
    create_env_config
    create_control_scripts
    create_readme

    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo "✅ Ollama installed and running"
    echo "✅ Required models downloaded"
    echo "✅ Control scripts created"
    echo "✅ Configuration files ready"
    echo ""
    echo "Next steps:"
    echo "1. Install Python dependencies: pip install -r requirements.txt"
    echo "2. Start your Auto Test Generation Tool"
    echo "3. Use ./status_ollama.sh to check Ollama status anytime"
    echo ""
    echo "📖 See OLLAMA_README.md for detailed usage instructions"
}

# Run main function
main "$@"