# 🚀 AI-Powered Code Generation Platform (SpectraGen) by Cognizant

An intelligent web-based platform that revolutionizes software development and testing workflows through AI-powered code generation, smart reuse capabilities, and comprehensive project management.

## 🌟 Overview

This platform combines the power of LLaMA/Ollama AI models with intelligent code analysis to streamline both **Developer** and **QA** workflows. Whether you're implementing user stories, generating test cases, or building applications from requirements, our platform provides automated, context-aware code generation with built-in quality assurance.

## ✨ Key Features

### 🔄 **Dual Workflow Support**
- **Developer Workflow**: Transform user stories, JIRA tickets, and requirements into production-ready code
- **QA Workflow**: Generate comprehensive test scripts from test cases and requirements
- **Codebase Intelligence**: Analyze existing codebases for smart code reuse and pattern recognition

### 🤖 **AI-Powered Generation**
- **Multiple AI Backends**: Support for Ollama, LLaMA 2, and auto-selection
- **Smart Model Selection**: Automatically chooses the best available AI model
- **Configurable Generation Options**: Unit tests, documentation, error handling, performance optimization
- **Context-Aware Prompts**: Leverages existing codebase patterns and libraries

### ⚡ **Smart Code Reuse**
- **Intelligent Matching**: Finds relevant existing code based on prompt analysis
- **Confidence Scoring**: Rates reuse candidates with confidence percentages
- **Time Estimation**: Calculates development time savings
- **Pattern Recognition**: Learns from existing code patterns and structures

### 🛠️ **Integrated Development Environment**
- **Multi-Tab Code Editor**: Edit, review, and manage generated code
- **Syntax Highlighting**: Python syntax highlighting with line numbers
- **Download & Save**: Export individual files or complete projects
- **Real-Time Validation**: Instant feedback on code quality and structure

### 📊 **Advanced Analytics & Reporting**
- **Code Review Reports**: Detailed HTML reports with quality metrics
- **Execution Analytics**: Success rates, performance metrics, and statistics
- **Progress Tracking**: Real-time progress monitoring for long-running operations
- **Debug Information**: Comprehensive logging and error reporting

## 🏗️ Architecture

### Backend Components

#### **Flask Application (`app.py`)**
- **Multi-Workflow Router**: Intelligent routing between Developer and QA workflows
- **Session Management**: Maintains state across user interactions
- **File Processing**: Handles uploads, parsing, and content extraction
- **API Endpoints**: RESTful APIs for all platform operations

#### **AI Code Generator (`Auto_test_gen.py`)**
- **Multi-Backend Support**: Ollama, LLaMA 2, and fallback mechanisms
- **Mode-Specific Generation**: Separate logic for Developer and QA modes
- **Smart Prompt Engineering**: Context-aware prompt construction
- **Code Separation**: Intelligent separation of main code and unit tests

#### **Smart Reuse Engine (`smart_code_reuse.py`)**
- **Pattern Analysis**: Deep analysis of existing code patterns
- **Semantic Matching**: NLP-based matching of prompts to existing code
- **Metadata Extraction**: Comprehensive code metadata collection
- **Confidence Algorithms**: Statistical confidence scoring for reuse suggestions

### Frontend Components

#### **Web Interface (`index.html`)**
- **Responsive Design**: Mobile-friendly, modern UI with dark/light themes
- **Dynamic Workflows**: Context-sensitive UI based on workflow type
- **Progress Visualization**: Real-time progress bars and status updates
- **Accessibility Features**: ARIA labels, keyboard navigation, screen reader support

#### **JavaScript Engine (`script.js`)**
- **Workflow Orchestration**: Coordinates complex multi-step processes
- **Real-Time Updates**: WebSocket-like polling for live updates
- **File Management**: Advanced file upload, parsing, and validation
- **Code Editor Integration**: Monaco-like editing experience

## 🚀 Quick Start

### Prerequisites

```bash
# Python 3.8+ required
python --version

# Install dependencies
pip install flask transformers torch requests
```

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ai-code-generation-platform
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up AI Backend (Choose One)**

   **Option A: Ollama (Recommended)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a code generation model
   ollama pull deepseek-coder:6.7b
   # OR
   ollama pull codellama:7b
   ```

   **Option B: LLaMA 2**
   ```bash
   # Requires Hugging Face authentication
   # Set up your HF token for meta-llama models
   ```

4. **Start the Application**
   ```bash
   python app.py
   ```

5. **Access the Platform**
   ```
   Open http://localhost:5000 in your browser
   ```

### First Run

1. **Upload Files**: Choose between user stories (Developer) or test cases (QA)
2. **Configure Options**: Select generation preferences (tests, docs, etc.)
3. **Generate Code**: Let AI create your code based on requirements
4. **Review & Edit**: Use the integrated editor to refine generated code
5. **Execute & Test**: Run generated code and review results

## 📋 Workflow Guide

### 🔧 Developer Workflow

1. **File Upload**
   - Upload JIRA stories, user requirements, or specification documents
   - Supports: `.txt`, `.md`, `.docx`, `.pdf`

2. **Codebase Integration** (Optional)
   - Upload existing codebase for context-aware generation
   - Platform analyzes patterns, libraries, and structures

3. **Generation Configuration**
   ```
   ✅ Include Unit Tests
   ✅ Generate Documentation  
   ✅ Use Existing Libraries
   ✅ Follow Project Patterns
   ✅ Include Error Handling
   ✅ Performance Optimized
   ```

4. **Code Generation**
   - AI processes requirements and generates implementation
   - Creates separate files for main code and unit tests
   - Applies existing codebase patterns and libraries

5. **Review & Refinement**
   - Multi-tab editor for easy code review
   - Syntax highlighting and validation
   - Download individual files or complete packages

### 🧪 QA Workflow

1. **Test Case Upload**
   - Upload test specifications and requirements
   - Automatic parsing of test case structure

2. **Script Generation**
   - AI generates executable test scripts
   - Supports multiple testing frameworks
   - Creates validation and assertion logic

3. **Execution Engine**
   - Run individual or batch test executions
   - Real-time progress monitoring
   - Detailed execution reports

4. **Results Analysis**
   - Pass/fail status with detailed output
   - Performance metrics and analytics
   - Downloadable HTML reports

## ⚙️ Configuration

### AI Backend Configuration

```python
# app.py - AI Configuration
AI_CONFIG = {
    'backend': 'auto',  # 'ollama', 'llama2', 'auto'
    'ollama_url': 'http://localhost:11434',
    'ollama_model': 'deepseek-coder:6.7b'
}
```

### Generation Options

```javascript
// script.js - Default Generation Options
{
    includeTests: true,      // Generate unit tests
    generateDocs: true,      // Include documentation
    useLibraries: true,      // Use existing libraries
    followPatterns: true,    // Follow code patterns
    includeErrors: true,     // Add error handling
    performanceOpt: false    // Performance optimization
}
```

## 🔌 API Reference

### Core Endpoints

#### **POST /ingest**
Processes uploaded files and determines workflow type.

```json
{
  "files": [
    {
      "name": "user_story.txt",
      "content": "As a user, I want..."
    }
  ],
  "mode": "auto"  // "auto", "developer", "qa"
}
```

#### **POST /generate_app_code**
Generates application code from processed requirements.

```json
{
  "success": true,
  "generated_code": [
    {
      "file_name": "implementation.py",
      "generated_code": "# Generated code...",
      "story_id": "STORY-001"
    }
  ]
}
```

#### **POST /execute_tests**
Executes generated test scripts.

```json
{
  "selected_tests": ["test1", "test2"],
  "execution_mode": "batch"
}
```

### Status Endpoints

#### **GET /ai_backend_status**
Returns current AI backend status and available models.

#### **GET /progress**
Real-time progress updates for long-running operations.

## 🧠 AI Models & Performance

### Supported Models

| Model | Size | Strengths | Use Case |
|-------|------|-----------|----------|
| `deepseek-coder:6.7b` | 6.7B | Code + Tests, Instruction following | **Recommended** |
| `codegemma:7b` | 7B | Google's code model | Alternative |
| `codellama:13b-instruct` | 13B | Large context, complex logic | Complex projects |
| `llama2:7b-chat` | 7B | General purpose | Fallback |

### Performance Optimization

- **Smart Model Selection**: Automatically uses the best available model
- **Context Window Management**: Optimizes prompts for model context limits
- **Caching**: Reuses analysis and patterns across sessions
- **Progressive Enhancement**: Graceful fallback when AI services unavailable

## 🏢 Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

### Environment Variables

```bash
# AI Configuration
AI_BACKEND=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder:6.7b

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key

# Performance
MAX_UPLOAD_SIZE=50MB
TIMEOUT_GENERATION=300
```

### Scaling Considerations

- **Load Balancing**: Multiple Flask instances behind nginx
- **AI Model Serving**: Dedicated Ollama servers for high throughput
- **File Storage**: External storage for large codebases
- **Caching**: Redis for session and analysis caching

## 🤝 Contributing

### Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd ai-code-generation-platform

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/

# Start development server
python app.py
```

### Code Style

- **Python**: PEP 8 compliant, type hints encouraged
- **JavaScript**: ES6+, functional programming patterns
- **Documentation**: Comprehensive docstrings and comments

### Testing

```bash
# Run unit tests
python -m pytest tests/unit/

# Run integration tests
python -m pytest tests/integration/

# Run frontend tests
npm test  # If using npm for frontend testing
```

## 📈 Roadmap

### Short Term (Next Release)
- [ ] **Visual Workflow Builder**: Drag-and-drop requirement creation
- [ ] **Advanced Code Review**: Static analysis integration
- [ ] **Template Library**: Pre-built templates for common patterns
- [ ] **Multi-Language Support**: JavaScript, Java, C# generation

### Medium Term
- [ ] **Cloud Integration**: AWS, Azure, GCP deployment templates
- [ ] **Team Collaboration**: Multi-user support and sharing
- [ ] **Version Control**: Git integration and versioning
- [ ] **API Testing**: Automated API test generation

### Long Term
- [ ] **Custom Model Training**: Domain-specific model fine-tuning
- [ ] **Visual Code Generation**: Diagram-to-code conversion
- [ ] **Enterprise Features**: SSO, audit trails, compliance
- [ ] **Mobile App**: Native mobile application

## 🐛 Troubleshooting

### Common Issues

#### **AI Backend Connection Failed**
```bash
# Check Ollama status
ollama list

# Restart Ollama service
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

#### **Code Generation Timeout**
```python
# Increase timeout in app.py
AI_CONFIG = {
    'timeout': 300  # 5 minutes
}
```

#### **Memory Issues with Large Models**
```bash
# Use smaller models
ollama pull codellama:7b  # Instead of 13b

# Or increase system memory/swap
```

### Debug Mode

```bash
# Enable debug logging
export FLASK_DEBUG=1
export PYTHONPATH=.

# Run with verbose logging
python app.py --debug
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama Team**: For the excellent local AI model serving
- **Meta AI**: For LLaMA model architecture
- **Hugging Face**: For model hosting and transformers library
- **Flask Team**: For the robust web framework
- **Open Source Community**: For countless libraries and tools

## 📞 Support

- **Documentation**: [Full documentation](docs/)
- **Issues**: [GitHub Issues](issues/)
- **Discussions**: [GitHub Discussions](discussions/)
- **Email**: support@your-platform.com

---

**Ready to revolutionize your development workflow?** 🚀 
[Get Started Now](#quick-start) or [View Live Demo](https://your-demo-url.com)