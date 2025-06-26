// ================================================================================================
// COGNIZANT AUTO TEST DASHBOARD - COMPLETE JAVASCRIPT WITH REAL PROGRESS TRACKING
// Multi-Test Case Support with Dynamic UI Generation + New Workflow + Real Progress
// ================================================================================================

// Global Variables
let uploadedFiles = [];
let currentOperation = null;
let ingestedTestCases = [];
let generatedScripts = [];
let executionResults = [];
// 1. ADD THESE NEW GLOBAL VARIABLES (add to existing global variables section)
let selectedTestCases = new Set(); // Track which test cases are selected for execution

// Progress tracking variables
let progressPollingInterval = null;
let currentTaskType = null;

// Add these new global variables for device management
let availableDevices = [];
let selectedDeviceId = null;
let deviceStatusPolling = null;

let currentMode = 'qa'; // Track current mode
let developerWorkflows = [];
let codebaseContext = {};
let generatedApplicationCode = [];
let selectedUserStories = new Set();

// Global variables for codebase management
let savedCodebases = [];
let currentCodebaseId = null;

// DOM Elements Cache
const elements = {
    uploadArea: null,
    fileInput: null,
    fileInfo: null,
    textArea: null,
    charCount: null,
    codeActions: null,
    progressContainer: null,
    progressTitle: null,
    progressStatus: null,
    progressBar: null,
    progressPercentage: null,
    progressSteps: null,
    toast: null,
    toastMessage: null
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================================================================================================
// INITIALIZATION AND SETUP
// ================================================================================================
// Initialize codebase management when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSavedCodebases();
    updateCodebaseSelector();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cognizant AutoTest Dashboard Loading...');

    // Cache DOM elements
    cacheElements();

    // Setup event listeners
    initializeEventListeners();
    setupNavigationListeners();

    // Initialize UI state
    updateCharCount();
    initializeHomePage();

    console.log('✅ Dashboard initialized successfully');
});

function cacheElements() {
    elements.uploadArea = document.querySelector('.upload-area');
    elements.fileInput = document.getElementById('fileInput');
    elements.developerFileInput = document.getElementById('developerFileInput'); // Add this
    elements.codebaseFileInput = document.getElementById('codebaseFileInput'); // Add this
    elements.fileInfo = document.getElementById('fileInfo');
    elements.textArea = document.getElementById('textArea');
    elements.charCount = document.getElementById('charCount');
    elements.codeActions = document.getElementById('codeActions');
    elements.progressContainer = document.getElementById('progressContainer');
    elements.progressTitle = document.getElementById('progressTitle');
    elements.progressStatus = document.getElementById('progressStatus');
    elements.progressBar = document.getElementById('progressBar');
    elements.progressPercentage = document.getElementById('progressPercentage');
    elements.progressSteps = document.getElementById('progressSteps');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toastMessage');
}

function hideSaveButtons() {
    console.log('🔒 Hiding save buttons after review/execution');

    // Hide save buttons in multi-test areas
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.style.display = 'none';
        console.log('🔒 Hidden save button in multi-test area');
    });

    // Hide save button in single text area (main code actions)
    const codeActions = document.getElementById('codeActions');
    if (codeActions) {
        const singleSaveButton = codeActions.querySelector('button[onclick="saveCode()"]');
        if (singleSaveButton) {
            singleSaveButton.style.display = 'none';
            console.log('🔒 Hidden save button in single text area');
        }
    }
}

function showSaveButtons() {
    console.log('🔓 Showing save buttons');

    // Show save buttons in multi-test areas
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.style.display = 'flex';
        console.log('🔓 Showed save button in multi-test area');
    });

    // Show save button in single text area
    const codeActions = document.getElementById('codeActions');
    if (codeActions) {
        const singleSaveButton = codeActions.querySelector('button[onclick="saveCode()"]');
        if (singleSaveButton) {
            singleSaveButton.style.display = 'inline-flex';
            console.log('🔓 Showed save button in single text area');
        }
    }
}

// Simplified modal with just one OK button
function showErrorModal(title, message, details = null) {
    console.log(`🚨 Error Modal: ${title} - ${message}`);

    // Create modal HTML with single OK button
    const modalHTML = `
        <div id="errorModal" class="error-modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(3px);
        ">
            <div class="error-modal-content" style="
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease-out;
            ">
                <div class="error-modal-header" style="
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    padding: 20px;
                    border-radius: 15px 15px 0 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                ">
                    <div style="
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">🚨</div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">${title}</h3>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Connection Error</p>
                    </div>
                </div>
                
                <div class="error-modal-body" style="
                    padding: 25px;
                    line-height: 1.6;
                ">
                    <div style="
                        background: #fef2f2;
                        border: 1px solid #fecaca;
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 20px;
                        color: #991b1b;
                    ">
                        <strong>Error Details:</strong><br>
                        ${message}
                    </div>
                    
                    ${details ? `
                        <div style="
                            background: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 10px;
                            padding: 15px;
                            margin-bottom: 20px;
                            font-family: 'Courier New', monospace;
                            font-size: 0.85rem;
                            color: #374151;
                            white-space: pre-wrap;
                        ">
                            <strong>Technical Details:</strong><br>
                            ${details}
                        </div>
                    ` : ''}
                    
                    <div style="
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 15px;
                        color: #1e40af;
                    ">
                        <strong>💡 Suggested Actions:</strong><br>
                        • Check your network connection<br>
                        • Verify Remote Device is powered on and accessible<br>
                        • Try executing the test again using the Execute Code button<br>
                        • Contact system administrator if problem persists
                    </div>
                </div>
                
                <div class="error-modal-footer" style="
                    padding: 20px 25px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: center;
                ">
                    <button onclick="closeErrorModal()" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 32px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
                    " onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.background='#3b82f6'; this.style.transform='translateY(0)'">
                        ✓ OK
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .error-modal-overlay {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `;

    // Remove any existing modal
    const existingModal = document.getElementById('errorModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Focus the OK button
    const modal = document.getElementById('errorModal');
    const okButton = modal.querySelector('button');
    okButton.focus();

    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeErrorModal();
        }
    };

    document.addEventListener('keydown', handleEscape);

    // Store cleanup function
    modal._cleanup = () => {
        document.removeEventListener('keydown', handleEscape);
    };
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        // Cleanup event listeners
        if (modal._cleanup) {
            modal._cleanup();
        }

        // Animate out
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // Note: Execute button remains enabled - user can retry manually
    console.log('✓ Modal closed - Execute button remains enabled for manual retry');
}

// Make functions globally available
window.showErrorModal = showErrorModal;
window.closeErrorModal = closeErrorModal;
/*
function initializeEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // File upload events
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('dragover', handleDragOver);
        elements.uploadArea.addEventListener('dragleave', handleDragLeave);
        elements.uploadArea.addEventListener('drop', handleDrop);
        elements.uploadArea.addEventListener('click', () => {
            if (elements.fileInput) elements.fileInput.click();
        });
    }

    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }

    // Text area events
    if (elements.textArea) {
        elements.textArea.addEventListener('input', handleTextAreaInput);
    }

    // Prevent default drag behaviors
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    console.log('✅ Event listeners attached');
}
*/

function initializeEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // QA Mode File upload events
    const qaUploadArea = document.querySelector('#qaContent .upload-area');
    const qaFileInput = document.getElementById('fileInput');

    if (qaUploadArea) {
        qaUploadArea.addEventListener('dragover', handleDragOver);
        qaUploadArea.addEventListener('dragleave', handleDragLeave);
        qaUploadArea.addEventListener('drop', handleDrop);
        qaUploadArea.addEventListener('click', () => {
            if (qaFileInput) qaFileInput.click();
        });
    }

    if (qaFileInput) {
        qaFileInput.addEventListener('change', handleFileSelect);
    }

    // Developer Mode File upload events
    const devUploadArea = document.querySelector('#developerContent .upload-area');
    const devFileInput = document.getElementById('developerFileInput');

    if (devUploadArea) {
        devUploadArea.addEventListener('dragover', handleDragOver);
        devUploadArea.addEventListener('dragleave', handleDragLeave);
        devUploadArea.addEventListener('drop', handleDrop);
        devUploadArea.addEventListener('click', () => {
            if (devFileInput) devFileInput.click();
        });
    }

    if (devFileInput) {
        devFileInput.addEventListener('change', handleFileSelect);
    }

    // Codebase Manager File upload events
    const codebaseUploadArea = document.querySelector('#codebaseManagerContent .upload-area');
    const codebaseFileInput = document.getElementById('codebaseFileInput');

    if (codebaseUploadArea) {
        codebaseUploadArea.addEventListener('dragover', handleDragOver);
        codebaseUploadArea.addEventListener('dragleave', handleDragLeave);
        codebaseUploadArea.addEventListener('drop', handleDrop);
        codebaseUploadArea.addEventListener('click', () => {
            if (codebaseFileInput) codebaseFileInput.click();
        });
    }

    if (codebaseFileInput) {
        codebaseFileInput.addEventListener('change', handleFileSelect);
    }

    // Text area events
    const textArea = document.getElementById('textArea');
    if (textArea) {
        textArea.addEventListener('input', handleTextAreaInput);
    }

    // Prevent default drag behaviors
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    console.log('✅ Event listeners attached');
}
function setupNavigationListeners() {
    console.log('🧭 Setting up navigation...');

    const navItems = document.querySelectorAll('.nav-item');

    if (navItems.length >= 2) {
        // Home navigation
        navItems[0].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🏠 Home navigation clicked');
            showHome();
        });

        // AutoTest navigation
        /*
        navItems[1].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🧪 AutoTest navigation clicked');
            showAutoTest();
        });
        */
        console.log('✅ Navigation listeners attached');
    } else {
        console.error('❌ Navigation items not found!');
    }
}

function initializeHomePage() {
    console.log('🏠 Initializing home page...');

    // Reset navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const homeNavItem = document.querySelectorAll('.nav-item')[0];
    if (homeNavItem) {
        homeNavItem.classList.add('active');
    }

    // Set initial content state
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    //const autoTestContent = document.getElementById('autoTestContent');
    const autoTestContent = document.getElementById('qaContent');

    if (dashboardTitle) dashboardTitle.textContent = 'Home';

    if (welcomeMessage) {
        welcomeMessage.classList.remove('hide');
        welcomeMessage.classList.add('show');
        welcomeMessage.style.display = 'block';
    }

    if (autoTestContent) {
        autoTestContent.classList.remove('show');
        autoTestContent.classList.add('hide');
        autoTestContent.style.display = 'none';
    }

    console.log('✅ Home page initialized');
}
/*
async function uploadCodebase() {
    console.log('📤 Starting codebase upload...');

    const codebaseFileInput = document.getElementById('codebaseFileInput');
    if (!codebaseFileInput || codebaseFileInput.files.length === 0) {
        showToast('Please select a codebase ZIP file first!', 'warning');
        return;
    }

    const uploadBtn = document.getElementById('uploadCodebaseBtn');
    if (!uploadBtn) return;

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading Codebase...';

    try {
        const formData = new FormData();
        const file = codebaseFileInput.files[0];
        formData.append('codebase', file);

        showProgress('Uploading Codebase', [
            'Uploading ZIP file',
            'Extracting codebase files',
            'Analyzing code structure',
            'Building context database',
            'Indexing functions and patterns'
        ]);

        updateProgress(20, 'Uploading file to server', 0);

        const response = await fetch('/upload_codebase', {
            method: 'POST',
            body: formData
        });

        updateProgress(40, 'Processing codebase', 1);

        const result = await response.json();

        if (result.success) {
            updateProgress(60, 'Analyzing code structure', 2);
            await delay(1000);

            updateProgress(80, 'Building context', 3);
            await delay(1000);

            updateProgress(100, 'Codebase loaded successfully', 4);

            // ADD DEBUG OUTPUT
            debugCodebaseData(result);

            // FIXED: Create complete context info with all data
            const completeContextInfo = {
                libraries_count: result.context_info.libraries_count,
                functions_count: result.context_info.functions_count,
                classes_count: result.context_info.classes_count || (result.classes ? Object.keys(result.classes).length : 0), // FIXED: Add classes_count
                patterns: result.context_info.patterns,
                libraries: result.libraries || [],
                functions: result.functions || {},
                classes: result.classes || {},
                dependencies: result.dependencies || []
            };

            console.log('📚 Complete context info being passed:', completeContextInfo);
            updateCodebaseStatus(completeContextInfo);

            // Enable the clear button
            const clearBtn = document.getElementById('clearCodebaseBtn');
            if (clearBtn) {
                clearBtn.disabled = false;
            }

            showToast(result.message, 'success');

            // Clear the file input
            codebaseFileInput.value = '';

        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Codebase upload error:', error);
        showToast('Failed to upload codebase: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Codebase';
        hideProgress();
    }
}
*/

// Save codebase to localStorage
function saveCodebaseToStorage(codebaseData) {
    try {
        const codebaseId = generateCodebaseId(codebaseData.name);
        const savedCodebase = {
            id: codebaseId,
            name: codebaseData.name || `Codebase-${Date.now()}`,
            syncTime: new Date().toISOString(),
            data: codebaseData,
            active: true
        };

        // Load existing codebases
        const existing = JSON.parse(localStorage.getItem('savedCodebases') || '[]');

        // Remove existing codebase with same ID if present
        const filtered = existing.filter(cb => cb.id !== codebaseId);

        // Add new codebase
        filtered.unshift(savedCodebase); // Add to beginning

        // Keep only last 10 codebases
        const trimmed = filtered.slice(0, 10);

        localStorage.setItem('savedCodebases', JSON.stringify(trimmed));
        savedCodebases = trimmed;

        console.log(`💾 Saved codebase: ${savedCodebase.name}`);
        updateCodebaseSelector();
        setCurrentCodebase(codebaseId);

        return codebaseId;
    } catch (error) {
        console.error('❌ Failed to save codebase:', error);
        showToast('Failed to save codebase locally', 'error');
        return null;
    }
}

// Load saved codebases from localStorage
function loadSavedCodebases() {
    try {
        const saved = localStorage.getItem('savedCodebases');
        savedCodebases = saved ? JSON.parse(saved) : [];
        console.log(`📚 Loaded ${savedCodebases.length} saved codebases`);
    } catch (error) {
        console.error('❌ Failed to load saved codebases:', error);
        savedCodebases = [];
    }
}

// Generate unique ID for codebase
function generateCodebaseId(name) {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const timestamp = Date.now();
    return `${cleanName}_${timestamp}`;
}

// Update codebase selector dropdown
function updateCodebaseSelector() {
    const selector = document.getElementById('codebaseSelector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Select Codebase...</option>';

    savedCodebases.forEach(codebase => {
        const option = document.createElement('option');
        option.value = codebase.id;
        option.textContent = `${codebase.name} (${formatSyncTime(codebase.syncTime)})`;
        selector.appendChild(option);
    });

    // Set current selection
    if (currentCodebaseId) {
        selector.value = currentCodebaseId;
    }
}

// Format sync time for display
function formatSyncTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
}

// Switch to a different codebase
function switchCodebase(codebaseId) {
    if (!codebaseId) {
        clearCurrentCodebaseDisplay();
        currentCodebaseId = null;
        return;
    }

    const codebase = savedCodebases.find(cb => cb.id === codebaseId);
    if (codebase) {
        setCurrentCodebase(codebaseId);
        displayCodebaseInSidebar(codebase.data);
        showToast(`Switched to: ${codebase.name}`, 'success');
    }
}

// Set current active codebase
function setCurrentCodebase(codebaseId) {
    currentCodebaseId = codebaseId;
    const selector = document.getElementById('codebaseSelector');
    if (selector) {
        selector.value = codebaseId;
    }
}

// Display codebase data in the sidebar
function displayCodebaseInSidebar(contextInfo) {
    console.log('📊 Displaying codebase in sidebar:', contextInfo);

    // Update current codebase status
    const statusDiv = document.getElementById('currentCodebaseStatus');
    if (statusDiv) {
        statusDiv.style.display = 'block';
    }

    // Update codebase name and sync time
    const codebase = savedCodebases.find(cb => cb.id === currentCodebaseId);
    if (codebase) {
        const nameElement = document.getElementById('currentCodebaseName');
        const timeElement = document.getElementById('syncTime');

        if (nameElement) nameElement.textContent = codebase.name;
        if (timeElement) timeElement.textContent = `Synced ${formatSyncTime(codebase.syncTime)}`;
    }

    // Update status indicator
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
        statusIndicator.className = 'status-indicator';
    }

    // Update stats
    updateSidebarStats(contextInfo);

    // Update expandable sections
    updateSidebarSections(contextInfo);
}

// Update sidebar statistics
function updateSidebarStats(contextInfo) {
    const stats = {
        libraries: contextInfo.libraries_count || (contextInfo.libraries ? contextInfo.libraries.length : 0),
        functions: contextInfo.functions_count || (contextInfo.functions ? Object.keys(contextInfo.functions).length : 0),
        classes: contextInfo.classes_count || (contextInfo.classes ? Object.keys(contextInfo.classes).length : 0),
        patterns: contextInfo.patterns ? (Array.isArray(contextInfo.patterns) ? contextInfo.patterns.length : Object.keys(contextInfo.patterns).length) : 0
    };

    document.getElementById('sidebarLibrariesCount').textContent = stats.libraries;
    document.getElementById('sidebarFunctionsCount').textContent = stats.functions;
    document.getElementById('sidebarClassesCount').textContent = stats.classes;
    document.getElementById('sidebarPatternsCount').textContent = stats.patterns;
}

// Update expandable sections content
function updateSidebarSections(contextInfo) {
    // Libraries
    const librariesList = document.getElementById('librariesList');
    if (librariesList && contextInfo.libraries) {
        librariesList.innerHTML = '';
        contextInfo.libraries.slice(0, 15).forEach(lib => {
            const span = document.createElement('span');
            span.className = 'compact-item';
            span.textContent = lib;
            librariesList.appendChild(span);
        });
        if (contextInfo.libraries.length > 15) {
            const more = document.createElement('span');
            more.className = 'compact-item';
            more.textContent = `+${contextInfo.libraries.length - 15} more`;
            more.style.background = '#f3f4f6';
            more.style.color = '#6b7280';
            librariesList.appendChild(more);
        }
    }

    // Functions
    const functionsList = document.getElementById('functionsList');
    if (functionsList && contextInfo.functions) {
        functionsList.innerHTML = '';
        const functions = Object.entries(contextInfo.functions).slice(0, 8);
        functions.forEach(([name, info]) => {
            const div = document.createElement('div');
            div.className = 'compact-function-item';
            div.innerHTML = `
                <span class="compact-function-name">${name.split('::').pop()}</span>
                <span class="compact-file-path">${info.file || 'Unknown file'}</span>
            `;
            functionsList.appendChild(div);
        });
    }

    // Classes
    const classesList = document.getElementById('classesList');
    if (classesList && contextInfo.classes) {
        classesList.innerHTML = '';
        const classes = Object.entries(contextInfo.classes).slice(0, 6);
        classes.forEach(([name, info]) => {
            const div = document.createElement('div');
            div.className = 'compact-class-item';
            div.innerHTML = `
                <span class="compact-class-name">${name.split('::').pop()}</span>
                <span class="compact-file-path">${info.file || 'Unknown file'}</span>
            `;
            classesList.appendChild(div);
        });
    }

    // Patterns
    const patternsList = document.getElementById('patternsList');
    if (patternsList && contextInfo.patterns) {
        patternsList.innerHTML = '';
        let patternsToShow = [];

        if (Array.isArray(contextInfo.patterns)) {
            patternsToShow = contextInfo.patterns;
        } else if (typeof contextInfo.patterns === 'object') {
            patternsToShow = Object.entries(contextInfo.patterns)
                .filter(([key, value]) => Array.isArray(value) && value.length > 0)
                .map(([key, value]) => `${key} (${value.length})`);
        }

        patternsToShow.forEach(pattern => {
            const span = document.createElement('span');
            span.className = 'compact-item';
            span.textContent = pattern;
            patternsList.appendChild(span);
        });
    }
}

// Toggle expandable sections
function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const toggle = document.getElementById(`${sectionId}-toggle`);

    if (content && toggle) {
        const isExpanded = content.classList.contains('expanded');

        if (isExpanded) {
            content.classList.remove('expanded');
            toggle.classList.remove('expanded');
            content.style.maxHeight = '0';
        } else {
            content.classList.add('expanded');
            toggle.classList.add('expanded');
            content.style.maxHeight = '200px';
        }
    }
}

// Clear current codebase display
function clearCurrentCodebaseDisplay() {
    const statusDiv = document.getElementById('currentCodebaseStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

// Resync current codebase
function resyncCurrentCodebase() {
    if (!currentCodebaseId) {
        showToast('No codebase selected to resync', 'warning');
        return;
    }

    const codebase = savedCodebases.find(cb => cb.id === currentCodebaseId);
    if (codebase) {
        showToast(`Resyncing ${codebase.name}...`, 'info');
        // You can add logic here to re-analyze the codebase
        // For now, just update the sync time
        codebase.syncTime = new Date().toISOString();
        localStorage.setItem('savedCodebases', JSON.stringify(savedCodebases));
        updateCodebaseSelector();
        displayCodebaseInSidebar(codebase.data);
    }
}

// Clear current codebase
function clearCurrentCodebase() {
    if (!currentCodebaseId) {
        showToast('No codebase selected to clear', 'warning');
        return;
    }

    const codebase = savedCodebases.find(cb => cb.id === currentCodebaseId);
    if (codebase && confirm(`Are you sure you want to remove "${codebase.name}" from saved codebases?`)) {
        // Remove from saved codebases
        savedCodebases = savedCodebases.filter(cb => cb.id !== currentCodebaseId);
        localStorage.setItem('savedCodebases', JSON.stringify(savedCodebases));

        // Clear current selection
        currentCodebaseId = null;
        clearCurrentCodebaseDisplay();
        updateCodebaseSelector();

        showToast(`Removed ${codebase.name}`, 'success');
    }
}

// REPLACE your existing uploadCodebase function with this version that includes persistence:
async function uploadCodebase() {
    console.log('📤 Starting codebase upload...');

    const codebaseFileInput = document.getElementById('codebaseFileInput');
    if (!codebaseFileInput || codebaseFileInput.files.length === 0) {
        showToast('Please select a codebase ZIP file first!', 'warning');
        return;
    }

    const uploadBtn = document.getElementById('uploadCodebaseBtn');
    if (!uploadBtn) return;

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading Codebase...';

    try {
        const formData = new FormData();
        const file = codebaseFileInput.files[0];
        formData.append('codebase', file);

        showProgress('Uploading Codebase', [
            'Uploading ZIP file',
            'Extracting codebase files',
            'Analyzing code structure',
            'Building context database',
            'Indexing functions and patterns'
        ]);

        updateProgress(20, 'Uploading file to server', 0);

        const response = await fetch('/upload_codebase', {
            method: 'POST',
            body: formData
        });

        updateProgress(40, 'Processing codebase', 1);

        const result = await response.json();

        if (result.success) {
            updateProgress(60, 'Analyzing code structure', 2);
            await delay(1000);

            updateProgress(80, 'Building context', 3);
            await delay(1000);

            updateProgress(100, 'Codebase loaded successfully', 4);

            // Create complete context info
            const completeContextInfo = {
                libraries_count: result.context_info.libraries_count,
                functions_count: result.context_info.functions_count,
                classes_count: result.context_info.classes_count || (result.classes ? Object.keys(result.classes).length : 0),
                patterns: result.context_info.patterns,
                libraries: result.libraries || [],
                functions: result.functions || {},
                classes: result.classes || {},
                dependencies: result.dependencies || []
            };

            console.log('📚 Complete context info:', completeContextInfo);

            // NEW: Save codebase for future use
            const codebaseToSave = {
                name: file.name.replace('.zip', ''),
                ...completeContextInfo
            };

            saveCodebaseToStorage(codebaseToSave);
            displayCodebaseInSidebar(completeContextInfo);

            // Enable the clear button
            const clearBtn = document.getElementById('clearCodebaseBtn');
            if (clearBtn) {
                clearBtn.disabled = false;
            }

            showToast(result.message, 'success');

            // Clear the file input
            codebaseFileInput.value = '';

            // Hide the codebase manager after successful upload
            setTimeout(() => {
                showDeveloperMode(); // Return to developer mode with loaded codebase
            }, 1000);

        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Codebase upload error:', error);
        showToast('Failed to upload codebase: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Codebase';
        hideProgress();
    }
}

async function clearCodebase() {
    console.log('🧹 Clearing codebase context...');

    if (!confirm('Are you sure you want to clear the loaded codebase context? This action cannot be undone.')) {
        return;
    }

    const clearBtn = document.getElementById('clearCodebaseBtn');
    if (!clearBtn) return;

    clearBtn.disabled = true;
    clearBtn.textContent = 'Clearing...';

    try {
        const response = await fetch('/clear_codebase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            // Reset the codebase status display
            updateCodebaseStatus({
                libraries_count: 0,
                functions_count: 0,
                patterns: []
            });

            // Clear file input
            const codebaseFileInput = document.getElementById('codebaseFileInput');
            if (codebaseFileInput) {
                codebaseFileInput.value = '';
            }

            clearBtn.disabled = true;
            clearBtn.textContent = 'Clear Context';

            showToast('Codebase context cleared successfully', 'success');
        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Clear codebase error:', error);
        showToast('Failed to clear codebase: ' + error.message, 'error');
    } finally {
        clearBtn.textContent = 'Clear Context';
    }
}

async function searchCodebase() {
    console.log('🔍 Searching codebase...');

    const searchInput = document.getElementById('codebaseSearchInput');
    const searchBtn = document.getElementById('searchCodebaseBtn');
    const resultsContainer = document.getElementById('codebaseSearchResults');

    if (!searchInput || !searchBtn || !resultsContainer) return;

    const query = searchInput.value.trim();
    if (!query) {
        showToast('Please enter a search query', 'warning');
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    try {
        const response = await fetch('/search_codebase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        const result = await response.json();

        if (result.success) {
            displaySearchResults(result.results);
            showToast(`Found ${result.results.length} matches`, 'success');
        } else {
            resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
            showToast(result.message, 'warning');
        }

    } catch (error) {
        console.error('❌ Search error:', error);
        showToast('Search failed: ' + error.message, 'error');
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('codebaseSearchResults');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
        return;
    }

    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-type">${result.type}</span>
                <span class="result-file">${result.file_path}</span>
            </div>
            <div class="result-content">
                <div class="result-name">${result.name}</div>
                ${result.snippet ? `<pre class="result-snippet">${result.snippet}</pre>` : ''}
                ${result.line_number ? `<span class="result-line">Line ${result.line_number}</span>` : ''}
            </div>
        `;
        resultsContainer.appendChild(resultItem);
    });
}

// ================================================================================================
// MODE MANAGEMENT FUNCTIONS
// ================================================================================================
/*
function displayCodebaseDetails(contextInfo) {
    console.log('📋 Displaying codebase details:', contextInfo);

    // Find or create a container for codebase details
    let detailsContainer = document.getElementById('codebaseDetails');
    if (!detailsContainer) {
        // Create the container if it doesn't exist
        detailsContainer = document.createElement('div');
        detailsContainer.id = 'codebaseDetails';
        detailsContainer.className = 'codebase-details';

        // Insert it after the codebase status
        const statusElement = document.getElementById('codebaseStatus');
        if (statusElement && statusElement.parentNode) {
            statusElement.parentNode.insertBefore(detailsContainer, statusElement.nextSibling);
        }
    }

    // Build the details HTML
    let detailsHTML = '';

    // Libraries section
    if (contextInfo.libraries && contextInfo.libraries.length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>📚 Available Libraries</h3>
                <div class="libraries-list">
                    ${contextInfo.libraries.map(lib => `<span class="library-item">${lib}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Functions section
    if (contextInfo.functions && Object.keys(contextInfo.functions).length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>⚡ Available Functions</h3>
                <div class="functions-list">
                    ${Object.entries(contextInfo.functions).map(([name, info]) => `
                        <div class="function-item">
                            <strong>${name}</strong>
                            ${info.file ? `<span class="file-path">${info.file}</span>` : ''}
                            ${info.docstring ? `<p class="docstring">${info.docstring}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Classes section
    if (contextInfo.classes && Object.keys(contextInfo.classes).length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>🏗️ Available Classes</h3>
                <div class="classes-list">
                    ${Object.entries(contextInfo.classes).map(([name, info]) => `
                        <div class="class-item">
                            <strong>${name}</strong>
                            ${info.file ? `<span class="file-path">${info.file}</span>` : ''}
                            ${info.methods && info.methods.length > 0 ? 
                                `<div class="methods">Methods: ${info.methods.join(', ')}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Patterns section
    if (contextInfo.patterns && contextInfo.patterns.length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>🔍 Detected Patterns</h3>
                <div class="patterns-list">
                    ${contextInfo.patterns.map(pattern => `<span class="pattern-item">${pattern}</span>`).join('')}
                </div>
            </div>
        `;
    }

    detailsContainer.innerHTML = detailsHTML || '<p>No codebase details available.</p>';
}
*/

function displayCodebaseDetails(contextInfo) {
    console.log('📋 Displaying codebase details:', contextInfo);

    // Find or create a container for codebase details
    let detailsContainer = document.getElementById('codebaseDetails');
    if (!detailsContainer) {
        // Create the container if it doesn't exist
        detailsContainer = document.createElement('div');
        detailsContainer.id = 'codebaseDetails';
        detailsContainer.className = 'codebase-details';

        // Insert it after the codebase status
        const statusElement = document.getElementById('codebaseStatus');
        if (statusElement && statusElement.parentNode) {
            statusElement.parentNode.insertBefore(detailsContainer, statusElement.nextSibling);
        }
    }

    // Build the details HTML
    let detailsHTML = '';

    // Libraries section - FIXED to handle array of library names
    if (contextInfo.libraries && Array.isArray(contextInfo.libraries) && contextInfo.libraries.length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>📚 Available Libraries (${contextInfo.libraries.length})</h3>
                <div class="libraries-list">
                    ${contextInfo.libraries.slice(0, 20).map(lib => `<span class="library-item">${lib}</span>`).join('')}
                    ${contextInfo.libraries.length > 20 ? `<span class="library-item">... and ${contextInfo.libraries.length - 20} more</span>` : ''}
                </div>
            </div>
        `;
    }

    // Functions section - FIXED to handle object of functions
    if (contextInfo.functions && typeof contextInfo.functions === 'object' && Object.keys(contextInfo.functions).length > 0) {
        const functionEntries = Object.entries(contextInfo.functions);
        detailsHTML += `
            <div class="codebase-section">
                <h3>⚡ Available Functions (${functionEntries.length})</h3>
                <div class="functions-list">
                    ${functionEntries.slice(0, 10).map(([name, info]) => `
                        <div class="function-item">
                            <strong>${name}</strong>
                            ${info.file ? `<span class="file-path">📁 ${info.file}</span>` : ''}
                            ${info.docstring ? `<p class="docstring">"${info.docstring.substring(0, 100)}${info.docstring.length > 100 ? '...' : ''}"</p>` : ''}
                            ${info.args ? `<p class="function-args">Args: ${info.args.join(', ')}</p>` : ''}
                        </div>
                    `).join('')}
                    ${functionEntries.length > 10 ? `<div class="function-item"><strong>... and ${functionEntries.length - 10} more functions</strong></div>` : ''}
                </div>
            </div>
        `;
    }

    // Classes section - FIXED to handle object of classes
    if (contextInfo.classes && typeof contextInfo.classes === 'object' && Object.keys(contextInfo.classes).length > 0) {
        const classEntries = Object.entries(contextInfo.classes);
        detailsHTML += `
            <div class="codebase-section">
                <h3>🏗️ Available Classes (${classEntries.length})</h3>
                <div class="classes-list">
                    ${classEntries.slice(0, 8).map(([name, info]) => `
                        <div class="class-item">
                            <strong>${name}</strong>
                            ${info.file ? `<span class="file-path">📁 ${info.file}</span>` : ''}
                            ${info.methods && info.methods.length > 0 ? 
                                `<div class="methods">Methods: ${info.methods.slice(0, 5).join(', ')}${info.methods.length > 5 ? '...' : ''}</div>` : ''}
                            ${info.docstring ? `<p class="docstring">"${info.docstring.substring(0, 80)}${info.docstring.length > 80 ? '...' : ''}"</p>` : ''}
                        </div>
                    `).join('')}
                    ${classEntries.length > 8 ? `<div class="class-item"><strong>... and ${classEntries.length - 8} more classes</strong></div>` : ''}
                </div>
            </div>
        `;
    }

    // Patterns section - FIXED to handle both array and object
    if (contextInfo.patterns) {
        let patternsToShow = [];

        if (Array.isArray(contextInfo.patterns)) {
            patternsToShow = contextInfo.patterns;
        } else if (typeof contextInfo.patterns === 'object') {
            // If patterns is an object, extract keys that have non-empty arrays
            patternsToShow = Object.entries(contextInfo.patterns)
                .filter(([key, value]) => Array.isArray(value) && value.length > 0)
                .map(([key, value]) => `${key} (${value.length} files)`);
        }

        if (patternsToShow.length > 0) {
            detailsHTML += `
                <div class="codebase-section">
                    <h3>🔍 Detected Patterns (${patternsToShow.length})</h3>
                    <div class="patterns-list">
                        ${patternsToShow.map(pattern => `<span class="pattern-item">${pattern}</span>`).join('')}
                    </div>
                </div>
            `;
        }
    }

    // Dependencies section (if available)
    if (contextInfo.dependencies && Array.isArray(contextInfo.dependencies) && contextInfo.dependencies.length > 0) {
        detailsHTML += `
            <div class="codebase-section">
                <h3>📦 Dependencies (${contextInfo.dependencies.length})</h3>
                <div class="dependencies-list">
                    ${contextInfo.dependencies.slice(0, 15).map(dep => `<span class="library-item">${dep}</span>`).join('')}
                    ${contextInfo.dependencies.length > 15 ? `<span class="library-item">... and ${contextInfo.dependencies.length - 15} more</span>` : ''}
                </div>
            </div>
        `;
    }

    if (!detailsHTML) {
        detailsHTML = '<p>No detailed codebase information available. The codebase may not contain analyzable Python files.</p>';
    }

    detailsContainer.innerHTML = detailsHTML;
    console.log('✅ Codebase details displayed successfully');
}

/*
// Add this function for codebase status updates
function updateCodebaseStatus(contextInfo) {
    console.log('📚 Updating codebase status');

    // Default empty context if not provided
    if (!contextInfo) {
        contextInfo = {
            libraries_count: 0,
            functions_count: 0,
            patterns: []
        };
    }

    const statusElement = document.getElementById('codebaseStatus');
    if (!statusElement) return;

    // Update the counts
    statusElement.innerHTML = `
        <div class="codebase-info">
            <span>📚 Libraries: ${contextInfo.libraries_count || 0}</span>
            <span>⚡ Functions: ${contextInfo.functions_count || 0}</span>
            <span>🔍 Patterns: ${contextInfo.patterns ? contextInfo.patterns.length : 0}</span>
        </div>
    `;

    // Update status indicator
    const statusPanel = document.getElementById('codebaseContextPanel');
    if (statusPanel) {
        if (contextInfo.libraries_count > 0) {
            statusPanel.classList.add('context-loaded');
        } else {
            statusPanel.classList.remove('context-loaded');
        }
    }
    // Display detailed codebase structure
    displayCodebaseDetails(contextInfo);
}
*/

function updateCodebaseStatus(contextInfo) {
    console.log('📚 Updating codebase status with data:', contextInfo);

    // Default empty context if not provided
    if (!contextInfo) {
        contextInfo = {
            libraries_count: 0,
            functions_count: 0,
            patterns: []
        };
    }

    const statusElement = document.getElementById('codebaseStatus');
    if (!statusElement) {
        console.error('❌ codebaseStatus element not found');
        return;
    }

    // FIXED: Extract the correct counts from contextInfo
    const librariesCount = contextInfo.libraries_count || (contextInfo.libraries ? contextInfo.libraries.length : 0);
    const functionsCount = contextInfo.functions_count || (contextInfo.functions ? Object.keys(contextInfo.functions).length : 0);
    const classesCount = contextInfo.classes_count || (contextInfo.classes ? Object.keys(contextInfo.classes).length : 0);
    const patternsCount = contextInfo.patterns ? (Array.isArray(contextInfo.patterns) ? contextInfo.patterns.length : Object.keys(contextInfo.patterns).length) : 0;

    console.log('📊 Extracted counts:', {
        libraries: librariesCount,
        functions: functionsCount,
        classes: classesCount,
        patterns: patternsCount
    });

    // FIXED: Update the status display with correct information
    statusElement.innerHTML = `
        <div class="codebase-info">
            <span>📚 Libraries: ${librariesCount}</span>
            <span>⚡ Functions: ${functionsCount}</span>
            <span>🏗️ Classes: ${classesCount}</span>
            <span>🔍 Patterns: ${patternsCount}</span>
        </div>
    `;

    // Update status indicator
    const statusPanel = document.getElementById('codebaseContextPanel');
    if (statusPanel) {
        if (librariesCount > 0 || functionsCount > 0 || classesCount > 0) {
            statusPanel.classList.add('context-loaded');
        } else {
            statusPanel.classList.remove('context-loaded');
        }
    }

    // Display detailed codebase structure
    displayCodebaseDetails(contextInfo);

    console.log('✅ Codebase status updated successfully');
}

// ALSO ADD this debug function to check what data is being received:
function debugCodebaseData(result) {
    console.log('🔍 DEBUG: Full backend response:', result);
    console.log('🔍 DEBUG: Context info:', result.context_info);
    console.log('🔍 DEBUG: Libraries array length:', result.libraries ? result.libraries.length : 'undefined');
    console.log('🔍 DEBUG: Functions object keys:', result.functions ? Object.keys(result.functions).length : 'undefined');
    console.log('🔍 DEBUG: Classes object keys:', result.classes ? Object.keys(result.classes).length : 'undefined');
    console.log('🔍 DEBUG: Patterns:', result.patterns);
}

async function loadCurrentContext() {
    try {
        const response = await fetch('/get_context');
        const context = await response.json();

        currentMode = context.current_mode;
        updateModeIndicator(currentMode);
        updateCodebaseStatus(context.codebase_info);

        console.log('✅ Context loaded:', context);
    } catch (error) {
        console.error('❌ Failed to load context:', error);
    }
}

function updateModeIndicator(mode) {
    const modeDisplay = document.getElementById('currentModeDisplay');
    if (modeDisplay) {
        const modeNames = {
            'qa': 'QA Testing',
            'developer': 'Code Development',
            'codebase': 'Codebase Manager'
        };
        modeDisplay.textContent = modeNames[mode] || mode;
    }
}

async function switchMode(newMode) {
    try {
        const response = await fetch('/switch_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mode: newMode })
        });

        const result = await response.json();

        if (result.success) {
            currentMode = newMode;
            updateModeIndicator(newMode);
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('❌ Mode switch error:', error);
        showToast('Failed to switch mode', 'error');
    }
}


// ================================================================================================
// NAVIGATION FUNCTIONS
// ================================================================================================

function resetDeveloperElements() {
    // Clear developer-specific data
    const developerFileInput = document.getElementById('developerFileInput');
    if (developerFileInput) developerFileInput.value = '';

    const developerFileInfo = document.getElementById('developerFileInfo');
    if (developerFileInfo) developerFileInfo.textContent = '';

    // Hide user stories container
    const userStoriesContainer = document.getElementById('userStoriesContainer');
    if (userStoriesContainer) userStoriesContainer.style.display = 'none';

    // Reset developer buttons
    const generateAppBtn = document.getElementById('generateAppBtn');
    const reviewAppBtn = document.getElementById('reviewAppBtn');
    const deployAppBtn = document.getElementById('deployAppBtn');

    if (generateAppBtn) generateAppBtn.disabled = true;
    if (reviewAppBtn) reviewAppBtn.disabled = true;
    if (deployAppBtn) deployAppBtn.disabled = true;
}

function resetQAElements() {
    // Clear any generated scripts info
    if (window.generatedScripts) {
        window.generatedScripts = [];
    }

    // Reset buttons
    const generateBtn = document.getElementById('generateBtn');
    const reviewBtn = document.getElementById('reviewBtn');
    const executeBtn = document.getElementById('executeBtn');

    if (generateBtn) generateBtn.disabled = true;
    if (reviewBtn) reviewBtn.disabled = true;
    if (executeBtn) executeBtn.disabled = true;

    // Clear text areas
    const textArea = document.getElementById('textArea');
    if (textArea) textArea.value = '';

    // Remove any dynamically created test areas
    const multiTestContainer = document.getElementById('multiTestContainer');
    if (multiTestContainer) {
        multiTestContainer.remove();
    }

    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) fileInfo.textContent = '';
}

function showDeveloperMode() {
    console.log('👨‍💻 Showing Developer Mode');

    hideAllModeContent();
    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const devNavItem = document.querySelectorAll('.nav-item')[1]; // Developer nav item
    if (devNavItem) devNavItem.classList.add('active');

    // Update content visibility
    const developerContent = document.getElementById('developerContent');
    if (developerContent) {
        developerContent.classList.remove('hide');
        developerContent.classList.add('show');
        developerContent.style.display = 'block';
    }

    // Update dashboard title
    const dashboardTitle = document.getElementById('dashboardTitle');
    if (dashboardTitle) dashboardTitle.textContent = '';

    // Switch mode on backend
    switchMode('developer');

    // Reset any QA-specific elements
    resetQAElements();

    console.log('✅ Developer mode displayed');
}

function showQAMode() {
    console.log('🧪 Showing QA Mode');

    hideAllModeContent();
    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const qaNavItem = document.querySelectorAll('.nav-item')[2]; // QA nav item
    if (qaNavItem) qaNavItem.classList.add('active');

    // Update content visibility
    const qaContent = document.getElementById('qaContent');
    if (qaContent) {
        qaContent.classList.remove('hide');
        qaContent.classList.add('show');
        qaContent.style.display = 'block';
    }

    // Update dashboard title
    const dashboardTitle = document.getElementById('dashboardTitle');
    if (dashboardTitle) dashboardTitle.textContent = '';

    // Switch mode on backend
    switchMode('qa');

    // Reset any developer-specific elements
    resetDeveloperElements();

    console.log('✅ QA mode displayed');
}

function showCodebaseManager() {
    console.log('📚 Showing Codebase Manager');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const codebaseNavItem = document.querySelectorAll('.nav-item')[3]; // Codebase nav item
    if (codebaseNavItem) codebaseNavItem.classList.add('active');

    // Update content visibility
    hideAllModeContent();
    const codebaseContent = document.getElementById('codebaseManagerContent');
    if (codebaseContent) {
        codebaseContent.classList.remove('hide');
        codebaseContent.classList.add('show');
        codebaseContent.style.display = 'block';
    }

    // Update dashboard title
    const dashboardTitle = document.getElementById('dashboardTitle');
    if (dashboardTitle) dashboardTitle.textContent = '';

    // Switch mode on backend
    switchMode('codebase');

    console.log('✅ Codebase manager displayed');
}

function hideAllModeContent() {
    console.log('🔄 Hiding all mode content...');

    // Hide welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.remove('show');
        welcomeMessage.classList.add('hide');
        welcomeMessage.style.display = 'none';
    }

    // Hide QA content
    const qaContent = document.getElementById('qaContent');
    if (qaContent) {
        qaContent.classList.remove('show');
        qaContent.classList.add('hide');
        qaContent.style.display = 'none';
    }

    // Hide Developer content
    const developerContent = document.getElementById('developerContent');
    if (developerContent) {
        developerContent.classList.remove('show');
        developerContent.classList.add('hide');
        developerContent.style.display = 'none';
    }

    // Hide Codebase Manager content
    const codebaseManagerContent = document.getElementById('codebaseManagerContent');
    if (codebaseManagerContent) {
        codebaseManagerContent.classList.remove('show');
        codebaseManagerContent.classList.add('hide');
        codebaseManagerContent.style.display = 'none';
    }

    // Hide any multi-test areas that might have been created
    const multiTestContainer = document.getElementById('multiTestContainer');
    if (multiTestContainer) {
        multiTestContainer.style.display = 'none';
    }

    // Hide single text area container
    const singleTextAreaContainer = document.getElementById('singleTextAreaContainer');
    if (singleTextAreaContainer) {
        singleTextAreaContainer.style.display = 'none';
    }

    // Hide any progress containers
    //const progressContainer = document.getElementById('progressContainer');
    //if (progressContainer) {
    //    progressContainer.style.display = 'none';
    //}

    const developerProgressContainer = document.getElementById('developerProgressContainer');
    if (developerProgressContainer) {
        developerProgressContainer.style.display = 'none';
    }

    console.log('✅ All mode content hidden');
}

/*
function showHome() {
    console.log('🏠 Showing Home page');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const homeNavItem = document.querySelectorAll('.nav-item')[0];
    if (homeNavItem) homeNavItem.classList.add('active');

    // Update content visibility
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const autoTestContent = document.getElementById('autoTestContent');

    if (dashboardTitle) dashboardTitle.textContent = '';

    if (welcomeMessage) {
        welcomeMessage.classList.remove('hide');
        welcomeMessage.classList.add('show');
        welcomeMessage.style.display = 'block';
    }

    if (autoTestContent) {
        autoTestContent.classList.remove('show');
        autoTestContent.classList.add('hide');
        autoTestContent.style.display = 'none';
    }

    console.log('✅ Home page displayed');
}
*/

// Override existing showHome function to work with new structure
function showHome() {
    console.log('🏠 Showing Home page');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const homeNavItem = document.querySelectorAll('.nav-item')[0];
    if (homeNavItem) homeNavItem.classList.add('active');

    // Hide all mode content
    hideAllModeContent();

    // Show welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.remove('hide');
        welcomeMessage.classList.add('show');
        welcomeMessage.style.display = 'block';
    }

    // Update dashboard title
    const dashboardTitle = document.getElementById('dashboardTitle');
    if (dashboardTitle) dashboardTitle.textContent = '';

    console.log('✅ Home page displayed');
}

function showAutoTest() {
    console.log('🧪 Showing AutoTest page');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const autoTestNavItem = document.querySelectorAll('.nav-item')[1];
    if (autoTestNavItem) autoTestNavItem.classList.add('active');

    // Update content visibility
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    //const autoTestContent = document.getElementById('autoTestContent');
    const autoTestContent = document.getElementById('qaContent');

    if (dashboardTitle) dashboardTitle.textContent = 'Auto Test';

    if (welcomeMessage) {
        welcomeMessage.classList.remove('show');
        welcomeMessage.classList.add('hide');
        welcomeMessage.style.display = 'none';
    }

    if (autoTestContent) {
        autoTestContent.classList.remove('hide');
        autoTestContent.classList.add('show');
        autoTestContent.style.display = 'block';
    }

    console.log('✅ AutoTest page displayed');
}

// ================================================================================================
// DEVELOPER MODE FUNCTIONS
// ================================================================================================
/*
async function ingestDeveloperRequirements() {
    console.log('📥 Starting developer requirements ingestion...');

    const devFileInput = document.getElementById('developerFileInput');
    if (!devFileInput || devFileInput.files.length === 0) {
        showToast('Please upload requirement files first!', 'warning');
        return;
    }

    const ingestBtn = document.getElementById('ingestDevBtn');
    if (!ingestBtn) return;

    ingestBtn.disabled = true;
    ingestBtn.textContent = 'Processing Requirements...';

    try {
        // Upload files first
        const formData = new FormData();
        Array.from(devFileInput.files).forEach(file => {
            formData.append('files', file);
        });

        // Add mode information
        formData.append('mode', 'developer');

        showProgress('Processing Requirements', [
            'Uploading requirement files',
            'Parsing user stories',
            'Extracting acceptance criteria',
            'Preparing for code generation'
        ]);

        updateProgress(25, 'Uploading files', 0);

        // Upload files
        const uploadResponse = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        updateProgress(50, 'Parsing requirements', 1);

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
            throw new Error(uploadResult.message);
        }

        updateProgress(75, 'Processing user stories', 2);

        // Process with developer workflow
        const ingestResponse = await fetch('/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: uploadResult.files,
                mode: 'developer'
            })
        });

        const ingestResult = await ingestResponse.json();

        updateProgress(100, 'Requirements processed successfully', 3);

        if (ingestResult.success) {
            developerWorkflows = ingestResult.processed_stories;
            displayUserStories(ingestResult.processed_stories);

            // Enable next step
            const generateBtn = document.getElementById('generateAppBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
            }

            showToast(ingestResult.message, 'success');
        } else {
            showToast(ingestResult.message, 'error');
        }

    } catch (error) {
        console.error('❌ Developer ingestion error:', error);
        showToast('Requirements processing failed: ' + error.message, 'error');
    } finally {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Requirements';
        hideProgress();
    }
}
*/

async function ingestDeveloperRequirements() {
    console.log('📥 Starting developer requirements ingestion...');

    const devFileInput = document.getElementById('developerFileInput');
    const requirementText = document.getElementById('requirementText').value.trim();
    const technicalNotes = document.getElementById('technicalNotes').value.trim();

    // Check if at least one input is provided
    if ((!devFileInput || devFileInput.files.length === 0) && !requirementText) {
        showToast('Please upload files or enter requirements!', 'warning');
        return;
    }

    const ingestBtn = document.getElementById('ingestDevBtn');
    if (!ingestBtn) return;

    ingestBtn.disabled = true;
    ingestBtn.textContent = 'Processing Requirements...';

    try {
        let uploadedContent = [];

        // Step 1: Upload and process files if any
        if (devFileInput && devFileInput.files.length > 0) {
            const formData = new FormData();
            Array.from(devFileInput.files).forEach(file => {
                formData.append('files', file);
            });

            showProgress('Processing Requirements', [
                'Uploading files',
                'Extracting content',
                'Parsing requirements',
                'Building AI prompt'
            ]);

            updateProgress(25, 'Uploading files', 0);

            const uploadResponse = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                throw new Error(uploadResult.message);
            }

            updateProgress(50, 'Extracting content', 1);

            // Get file contents
            for (const file of uploadResult.files) {
                const contentResponse = await fetch('/get_file_content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filepath: file.path })
                });

                const contentResult = await contentResponse.json();
                if (contentResult.success) {
                    uploadedContent.push({
                        filename: file.name,
                        content: contentResult.content,
                        type: detectContentType(file.name, contentResult.content)
                    });
                }
            }
        }

        updateProgress(75, 'Building AI prompt', 2);

        // Step 2: Build the comprehensive prompt
        const aiPrompt = buildAIPrompt({
            workflowType: window.selectedWorkflowType || 'jira',
            uploadedContent: uploadedContent,
            requirementText: requirementText,
            technicalNotes: technicalNotes,
            generationOptions: getGenerationOptions()
        });

        updateProgress(90, 'Preparing for code generation', 3);

        // Step 3: Send to backend for processing
        const response = await fetch('/process_developer_prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: aiPrompt,
                workflowType: window.selectedWorkflowType || 'jira',
                rawInputs: {
                    files: uploadedContent,
                    requirements: requirementText,
                    technicalNotes: technicalNotes
                }
            })
        });

        const result = await response.json();

        updateProgress(100, 'Requirements processed successfully', 3);

        if (result.success) {
            // Display the processed requirements
            displayProcessedRequirements(result);

            // Enable generate button
            const generateBtn = document.getElementById('generateAppBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
            }

            showToast('Requirements ingested successfully!', 'success');
        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Ingestion error:', error);
        showToast('Requirements processing failed: ' + error.message, 'error');
    } finally {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Requirements';
        hideProgress();
    }
}

function buildAIPrompt(data) {
    const { workflowType, uploadedContent, requirementText, technicalNotes, generationOptions } = data;

    let prompt = `You are an expert software developer tasked with generating production-ready code.\n\n`;

    // Add workflow context
    switch(workflowType) {
        case 'jira':
            prompt += `TASK TYPE: JIRA User Story Implementation\n`;
            prompt += `Generate code that fully implements the user story with all acceptance criteria.\n\n`;
            break;
        case 'feature':
            prompt += `TASK TYPE: New Feature Implementation\n`;
            prompt += `Create a complete feature implementation based on the requirements.\n\n`;
            break;
        case 'enhancement':
            prompt += `TASK TYPE: Code Enhancement\n`;
            prompt += `Enhance existing code with improvements and optimizations.\n\n`;
            break;
        case 'bug':
            prompt += `TASK TYPE: Bug Fix\n`;
            prompt += `Fix the reported bug and ensure the solution is robust.\n\n`;
            break;
    }

    // Add uploaded file contents
    if (uploadedContent.length > 0) {
        prompt += `=== UPLOADED REQUIREMENTS ===\n`;
        uploadedContent.forEach((file, index) => {
            prompt += `\n--- File ${index + 1}: ${file.filename} ---\n`;
            prompt += `Type: ${file.type}\n`;
            prompt += `Content:\n${file.content}\n`;
            prompt += `--- End of ${file.filename} ---\n`;
        });
        prompt += `\n`;
    }

    // Add manual requirements
    if (requirementText) {
        prompt += `=== USER REQUIREMENTS ===\n`;
        prompt += `${requirementText}\n\n`;
    }

    // Add technical notes
    if (technicalNotes) {
        prompt += `=== TECHNICAL NOTES ===\n`;
        prompt += `${technicalNotes}\n\n`;
    }

    // Add generation options
    prompt += `=== GENERATION REQUIREMENTS ===\n`;
    if (generationOptions.includeTests) {
        prompt += `- Include comprehensive unit tests with good coverage\n`;
    }
    if (generationOptions.generateDocs) {
        prompt += `- Generate detailed documentation with docstrings and comments\n`;
    }
    if (generationOptions.useLibraries) {
        prompt += `- Utilize existing libraries and frameworks when appropriate\n`;
    }
    if (generationOptions.followPatterns) {
        prompt += `- Follow established project patterns and coding standards\n`;
    }
    if (generationOptions.includeErrors) {
        prompt += `- Include robust error handling and validation\n`;
    }
    if (generationOptions.performanceOpt) {
        prompt += `- Optimize for performance and efficiency\n`;
    }

    // Add specific instructions
    prompt += `\n=== INSTRUCTIONS ===\n`;
    prompt += `1. Analyze all provided requirements carefully\n`;
    prompt += `2. Generate clean, modular, and maintainable code\n`;
    prompt += `3. Follow best practices and design patterns\n`;
    prompt += `4. Ensure the code is production-ready\n`;
    prompt += `5. Include all necessary imports and dependencies\n`;
    prompt += `6. Make the code self-documenting where possible\n`;

    if (workflowType === 'jira') {
        prompt += `7. Ensure ALL acceptance criteria are met\n`;
        prompt += `8. Implement exactly what the user story requests\n`;
    }

    prompt += `\nGenerate the complete implementation now:\n`;

    return prompt;
}

function detectContentType(filename, content) {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerFilename.includes('jira') || content.includes('acceptance criteria')) {
        return 'JIRA Story';
    } else if (lowerContent.includes('feature request') || lowerContent.includes('feature:')) {
        return 'Feature Request';
    } else if (lowerContent.includes('bug') || lowerContent.includes('error') || lowerContent.includes('issue')) {
        return 'Bug Report';
    } else if (lowerContent.includes('enhancement') || lowerContent.includes('improve')) {
        return 'Enhancement Request';
    }
    return 'Requirement Document';
}

function getGenerationOptions() {
    return {
        includeTests: document.getElementById('includeTests')?.checked || false,
        generateDocs: document.getElementById('generateDocs')?.checked || false,
        useLibraries: document.getElementById('useLibraries')?.checked || false,
        followPatterns: document.getElementById('followPatterns')?.checked || false,
        includeErrors: document.getElementById('includeErrors')?.checked || false,
        performanceOpt: document.getElementById('performanceOpt')?.checked || false
    };
}

function displayProcessedRequirements(result) {
    // Create or update a section to show processed requirements
    let container = document.getElementById('processedRequirementsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'processedRequirementsContainer';
        container.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            background: #f0f9ff;
            border-radius: 12px;
            border: 1px solid #3b82f6;
        `;

        // Insert after the generation options
        const genOptions = document.querySelector('.generation-options') ||
                          document.querySelector('[style*="Generation Options"]');
        if (genOptions && genOptions.parentNode) {
            genOptions.parentNode.insertBefore(container, genOptions.nextSibling);
        }
    }

    container.innerHTML = `
        <h3 style="color: #1e40af; margin-bottom: 15px;">✅ Requirements Processed</h3>
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="color: #374151; margin-bottom: 10px;">Extracted Requirements:</h4>
            <pre style="white-space: pre-wrap; color: #4b5563; font-size: 0.9rem;">${result.extractedRequirements || 'Processing complete'}</pre>
        </div>
        ${result.prompt ? `
            <details style="margin-top: 15px;">
                <summary style="cursor: pointer; color: #6b7280; font-size: 0.9rem;">View AI Prompt (Debug)</summary>
                <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; 
                           border-radius: 8px; margin-top: 10px; font-size: 0.8rem; 
                           max-height: 300px; overflow-y: auto;">${result.prompt}</pre>
            </details>
        ` : ''}
    `;
}

function displayUserStories(stories) {
    const container = document.getElementById('userStoriesContainer');
    const grid = document.getElementById('storiesGrid');

    if (!container || !grid) return;

    container.style.display = 'block';
    grid.innerHTML = '';

    stories.forEach((story, index) => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            <div class="story-header">
                <div class="story-checkbox">
                    <input type="checkbox" id="story${index}" checked 
                           onchange="toggleStorySelection('${story.id}', this.checked)">
                    <label for="story${index}">Select for generation</label>
                </div>
                <div class="story-id">${story.id}</div>
            </div>
            <div class="story-content">
                <h4 class="story-title">${story.title}</h4>
                <p class="story-description">${story.description}</p>
                <div class="story-criteria">
                    <strong>Acceptance Criteria:</strong>
                    <p>${story.acceptance_criteria}</p>
                </div>
                <div class="story-meta">
                    <span class="story-priority">Priority: ${story.priority || 'Medium'}</span>
                    <span class="story-epic">Epic: ${story.epic || 'N/A'}</span>
                </div>
            </div>
        `;

        grid.appendChild(storyCard);

        // Add to selected stories by default
        selectedUserStories.add(story.id);
    });

    updateStorySelectionStatus();
}

function toggleStorySelection(storyId, isSelected) {
    if (isSelected) {
        selectedUserStories.add(storyId);
    } else {
        selectedUserStories.delete(storyId);
    }

    updateStorySelectionStatus();
    console.log(`📝 Story ${storyId} ${isSelected ? 'selected' : 'deselected'}`);
}

function updateStorySelectionStatus() {
    const generateBtn = document.getElementById('generateAppBtn');
    if (generateBtn) {
        if (selectedUserStories.size === 0) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generate Application Code (Select Stories)';
        } else {
            generateBtn.disabled = false;
            generateBtn.textContent = `Generate Code (${selectedUserStories.size} Selected)`;
        }
    }
}

function updateCodeAreaCharCount(index) {
    const textarea = document.getElementById(`appCode${index}`);
    const charCount = document.getElementById(`appCodeCharCount${index}`);

    if (textarea && charCount) {
        const count = textarea.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }
}

function autoResizeCodeTextarea(index) {
    const textarea = document.getElementById(`appCode${index}`);
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    }
}

async function generateApplicationCode() {
    console.log('🔧 Starting application code generation...');

    if (selectedUserStories.size === 0) {
        showToast('Please select at least one user story for code generation', 'warning');
        return;
    }

    const generateBtn = document.getElementById('generateAppBtn');
    if (!generateBtn) return;

    generateBtn.disabled = true;
    generateBtn.classList.add('btn-loading');

    try {
        showProgress('Generating Application Code', [
            'Analyzing user stories',
            'Loading codebase context',
            'Generating Python code',
            'Optimizing implementation',
            'Finalizing code structure'
        ]);

        updateProgress(20, 'Analyzing selected user stories', 0);
        await delay(1000);

        updateProgress(40, 'Loading codebase context', 1);
        await delay(1000);

        updateProgress(60, 'Generating application code', 2);

        const response = await fetch('/generate_app_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_story_ids: Array.from(selectedUserStories)
            })
        });

        updateProgress(80, 'Optimizing implementation', 3);
        await delay(1000);

        const result = await response.json();

        updateProgress(100, 'Code generation completed', 4);

        if (result.success) {
            generatedApplicationCode = result.generated_code;
            displayGeneratedCode(result.generated_code);

            // Enable review button
            const reviewBtn = document.getElementById('reviewAppBtn');
            if (reviewBtn) {
                reviewBtn.disabled = false;
            }

            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Code generation error:', error);
        showToast('Code generation failed: ' + error.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.classList.remove('btn-loading');
        generateBtn.textContent = `Generate Code (${selectedUserStories.size} Selected)`;
        hideProgress();
    }
}

function displayGeneratedCode(codeResults) {
    const container = document.getElementById('generatedCodeContainer');
    if (!container) return;

    container.innerHTML = '';
    container.style.display = 'block';

    // Create header
    const header = document.createElement('div');
    header.className = 'generated-code-header';
    header.innerHTML = `
        <h3>🚀 Generated Application Code</h3>
        <p>Review and customize the generated implementation code</p>
    `;
    container.appendChild(header);

    // Create code areas for each generated file
    codeResults.forEach((codeResult, index) => {
        const codeGroup = document.createElement('div');
        codeGroup.className = 'code-group';
        codeGroup.innerHTML = `
            <div class="code-header">
                <h4>${codeResult.story_title}</h4>
                <div class="code-meta">
                    <span class="story-id">${codeResult.story_id}</span>
                    <span class="file-name">${codeResult.file_name}</span>
                </div>
            </div>
            <div class="code-content">
                <textarea 
                    class="code-textarea" 
                    id="appCode${index}"
                    placeholder="Generated code will appear here..."
                    oninput="updateCodeAreaCharCount(${index}); autoResizeCodeTextarea(${index})"
                >${codeResult.generated_code}</textarea>
                <div class="code-char-count" id="appCodeCharCount${index}">
                    ${codeResult.generated_code.length} characters
                </div>
                <div class="code-actions">
                    <button class="action-btn save-btn" onclick="saveApplicationCode(${index})" title="Save code">
                        💾
                    </button>
                    <button class="action-btn download-btn" onclick="downloadApplicationCode(${index})" title="Download code">
                        📥
                    </button>
                </div>
            </div>
        `;

        container.appendChild(codeGroup);

        // Auto-resize textarea
        setTimeout(() => autoResizeCodeTextarea(index), 100);
    });
}

function saveApplicationCode(index) {
    console.log(`💾 Saving application code ${index}`);

    const textarea = document.getElementById(`appCode${index}`);
    if (!textarea) return;

    const code = textarea.value.trim();
    if (!code) {
        showToast('No code to save!', 'warning');
        return;
    }

    // Save to localStorage as backup
    localStorage.setItem(`app_code_${index}`, code);
    localStorage.setItem(`app_code_${index}_timestamp`, new Date().toISOString());

    showToast(`Application code ${index + 1} saved successfully!`, 'success');
}

function downloadApplicationCode(index) {
    console.log(`📥 Downloading application code ${index}`);

    const textarea = document.getElementById(`appCode${index}`);
    if (!textarea) return;

    const code = textarea.value.trim();
    if (!code) {
        showToast('No code to download!', 'warning');
        return;
    }

    const codeData = generatedApplicationCode[index];
    const filename = codeData ? codeData.file_name : `application_code_${index + 1}.py`;

    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/x-python' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`${filename} downloaded successfully!`, 'success');
}

// ================================================================================================
// REAL PROGRESS TRACKING FUNCTIONS
// ================================================================================================

function startRealProgress(taskType, title, initialSteps = []) {
    console.log(`🚀 Starting real progress tracking for: ${taskType}`);

    currentTaskType = taskType;

    // Show progress container
    showProgress(title, initialSteps);

    // Reset progress
    updateProgress(0, 'Initializing...', 0);

    // Start polling for real progress
    progressPollingInterval = setInterval(() => {
        pollProgress(taskType);
    }, 500); // Poll every 500ms for smooth updates
}

async function pollProgress(taskType) {
    try {
        const response = await fetch(`/progress/${taskType}`);
        const progressData = await response.json();

        // Update UI with real progress
        updateProgress(
            progressData.progress,
            progressData.step,
            Math.floor(progressData.progress / 20) // Convert to step index
        );

        // Check if task is completed
        if (progressData.completed) {
            console.log(`✅ Task ${taskType} completed with progress: ${progressData.progress}%`);
            stopProgressPolling();

            // Small delay to show 100% before hiding
            setTimeout(() => {
                hideProgress();
            }, 1000);
        }

    } catch (error) {
        console.error(`❌ Error polling progress for ${taskType}:`, error);
        // Don't stop polling on error - backend might be processing
    }
}

function stopProgressPolling() {
    if (progressPollingInterval) {
        clearInterval(progressPollingInterval);
        progressPollingInterval = null;
        currentTaskType = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopProgressPolling();
});

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

function preventDefault(e) {
    e.preventDefault();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': '📄', 'rtf': '📄', 'doc': '📝', 'docx': '📝',
        'xls': '📊', 'xlsx': '📊', 'csv': '📈', 'txt': '📄',
        'js': '💻', 'py': '🐍', 'html': '🌐', 'css': '🎨',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'zip': '📦', 'rar': '📦'
    };
    return iconMap[ext] || '📄';
}

// ================================================================================================
// TOAST NOTIFICATION SYSTEM
// ================================================================================================

function showToast(message, type = 'info') {
    console.log(`📢 Toast: ${message} (${type})`);

    if (elements.toastMessage && elements.toast) {
        elements.toastMessage.textContent = message;
        elements.toast.className = `toast show ${type}`;

        // Auto-hide after 5 seconds
        setTimeout(() => hideToast(), 5000);
    }
}

function hideToast() {
    if (elements.toast) {
        elements.toast.classList.remove('show');
    }
}

// ================================================================================================
// PROGRESS INDICATOR SYSTEM
// ================================================================================================

function showProgress(title, steps) {
    if (!elements.progressContainer || !elements.progressTitle || !elements.progressSteps) return;

    elements.progressTitle.textContent = title;
    elements.progressContainer.classList.add('show');

    // Create step elements
    elements.progressSteps.innerHTML = '';
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'progress-step';
        stepElement.innerHTML = `
            <div class="step-icon pending" id="step-${index}">●</div>
            <span>${step}</span>
        `;
        elements.progressSteps.appendChild(stepElement);
    });
}

function updateProgress(percentage, status, activeStepIndex = -1) {
    if (!elements.progressBar || !elements.progressPercentage || !elements.progressStatus) return;

    elements.progressBar.style.width = percentage + '%';
    elements.progressPercentage.textContent = Math.round(percentage) + '%';
    elements.progressStatus.textContent = status;

    // Update step states
    const stepElements = elements.progressSteps.querySelectorAll('.progress-step');
    stepElements.forEach((step, index) => {
        const icon = step.querySelector('.step-icon');
        step.classList.remove('active', 'completed');
        icon.classList.remove('active', 'completed', 'pending');

        if (index < activeStepIndex) {
            step.classList.add('completed');
            icon.classList.add('completed');
            icon.textContent = '✓';
        } else if (index === activeStepIndex) {
            step.classList.add('active');
            icon.classList.add('active');
            icon.textContent = '●';
        } else {
            icon.classList.add('pending');
            icon.textContent = '●';
        }
    });
}

function hideProgress() {
    setTimeout(() => {
        if (elements.progressContainer) {
            elements.progressContainer.classList.remove('show');
        }
    }, 1000);
}

// ================================================================================================
// FILE HANDLING SYSTEM
// ================================================================================================

function handleDragOver(e) {
    e.preventDefault();
    if (elements.uploadArea) elements.uploadArea.classList.add('dragover');
}

function handleDragLeave() {
    if (elements.uploadArea) elements.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    if (elements.uploadArea) elements.uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    console.log(`📁 Files dropped: ${files.length}`);
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    console.log(`📁 Files selected: ${files.length}`);
    if (files && files.length > 0) {
        handleFiles(files);
    }
}

async function handleFiles(files) {
    if (files.length === 0) {
        console.log('⚠️ No files to handle');
        return;
    }

    console.log('📤 Processing files:', Array.from(files).map(f => f.name));

    try {
        showProgress('Uploading Files', [
            'Preparing files',
            'Uploading to server',
            'Processing files'
        ]);

        const formData = new FormData();
        Array.from(files).forEach(file => {
            console.log(`📎 Adding file: ${file.name} (${formatFileSize(file.size)})`);
            formData.append('files', file);
        });

        updateProgress(30, 'Uploading files to server', 1);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        updateProgress(70, 'Processing uploaded files', 2);

        const result = await response.json();
        console.log('📥 Upload result:', result);

        if (result.success) {
            uploadedFiles = result.files;
            displayFileInfo(result.files, result.total_size);
            resetButtonStates();
            updateProgress(100, 'Upload completed successfully', 2);
            showToast(result.message, 'success');
        } else {
            console.error('❌ Upload failed:', result.message);
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
    } finally {
        hideProgress();
    }
}

function displayFileInfo(files, totalSize) {
    if (!elements.fileInfo) return;

    let fileListHtml = '<div class="file-preview">';
    files.forEach(file => {
        fileListHtml += `
            <div class="file-item">
                <span class="file-icon">${getFileIcon(file.name)}</span>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
        `;
    });
    fileListHtml += '</div>';

    elements.fileInfo.innerHTML = `
        <strong>Files Selected:</strong> ${files.length} file(s)<br>
        <strong>Total Size:</strong> ${formatFileSize(totalSize)}
        ${fileListHtml}
    `;
    elements.fileInfo.style.display = 'block';
}

function resetButtonStates() {
    console.log('🔄 Resetting button states for new workflow');

    const generateBtn = document.getElementById('generateBtn');
    const reviewBtn = document.getElementById('reviewBtn');
    const executeBtn = document.getElementById('executeBtn');
    const ingestBtn = document.getElementById('ingestBtn');
    const reportButtons = document.getElementById('reportButtons');

    // Reset global data
    ingestedTestCases = [];
    generatedScripts = [];
    executionResults = [];

    // Hide multi-test areas
    hideMultiTestAreas();

    // UPDATED BUTTON STATES FOR NEW WORKFLOW
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generate Code';
        generateBtn.style.opacity = '0.6';
        generateBtn.style.cursor = 'not-allowed';
    }

    if (reviewBtn) {
        reviewBtn.disabled = true;
        reviewBtn.textContent = 'Review Code';
        reviewBtn.style.opacity = '0.6';
        reviewBtn.style.cursor = 'not-allowed';
    }

    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Execute Code';
        executeBtn.style.opacity = '0.6';
        executeBtn.style.cursor = 'not-allowed';
    }

    if (ingestBtn) {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Test';
        ingestBtn.style.opacity = '1';
        ingestBtn.style.cursor = 'pointer';
    }

    // Reset text area
    if (elements.textArea) elements.textArea.value = '';
    updateCharCount();
    if (elements.codeActions) elements.codeActions.classList.remove('show');
    if (reportButtons) reportButtons.classList.remove('show');

    // ADD THIS LINE: Show save buttons when resetting for new workflow
    showSaveButtons();
}

// Make sure the new functions are globally available
window.hideSaveButtons = hideSaveButtons;
window.showSaveButtons = showSaveButtons;

// ================================================
// DEVICE MANAGEMENT
// ================================================
// Device Management Functions
async function loadAvailableDevices() {
    console.log('🔌 Loading available devices...');

    try {
        const response = await fetch('/devices');
        const result = await response.json();

        if (result.success) {
            availableDevices = result.devices;
            console.log(`📡 Loaded ${availableDevices.length} devices:`, availableDevices);
            return availableDevices;
        } else {
            console.error('❌ Failed to load devices:', result.message);
            showToast(result.message, 'error');
            return [];
        }
    } catch (error) {
        console.error('❌ Error loading devices:', error);
        showToast('Failed to load available devices', 'error');
        return [];
    }
}

async function checkDeviceStatus(deviceId) {
    console.log(`🔍 Checking status for device: ${deviceId}`);

    try {
        const response = await fetch(`/devices/${deviceId}/status`);
        const result = await response.json();

        if (result.success) {
            console.log(`📡 Device ${deviceId} status:`, result.status);
            return result;
        } else {
            console.error(`❌ Failed to check device ${deviceId} status:`, result.message);
            return {
                success: false,
                status: 'error',
                message: result.message,
                is_online: false
            };
        }
    } catch (error) {
        console.error(`❌ Error checking device ${deviceId} status:`, error);
        return {
            success: false,
            status: 'error',
            message: error.message,
            is_online: false
        };
    }
}

function getStatusIcon(status) {
    const statusIcons = {
        'online': '🟢',
        'offline': '🔴',
        'timeout': '🟡',
        'ssh_error': '🟠',
        'auth_error': '🔒',
        'error': '❌',
        'unknown': '⚪',
        'checking': '🔄'
    };
    return statusIcons[status] || '❓';
}

function getStatusColor(status) {
    const statusColors = {
        'online': '#22c55e',
        'offline': '#ef4444',
        'timeout': '#f59e0b',
        'ssh_error': '#f97316',
        'auth_error': '#8b5cf6',
        'error': '#ef4444',
        'unknown': '#6b7280',
        'checking': '#3b82f6'
    };
    return statusColors[status] || '#6b7280';
}

function createDeviceSelectionModal() {
    console.log('🎛️ Creating device selection modal');

    if (!availableDevices || availableDevices.length === 0) {
        showToast('No devices available for selection', 'warning');
        return;
    }

    // Remove existing modal
    const existingModal = document.getElementById('deviceSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="deviceSelectionModal" class="device-modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(3px);
            animation: fadeIn 0.3s ease-out;
        ">
            <div class="device-modal-content" style="
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: modalSlideIn 0.4s ease-out;
            ">
                <div class="device-modal-header" style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 25px 30px;
                    border-radius: 20px 20px 0 0;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
                        animation: shimmer 3s infinite;
                    "></div>
                    <div style="position: relative; z-index: 1;">
                        <h3 style="margin: 0; font-size: 1.4rem; font-weight: 600; display: flex; align-items: center; gap: 12px;">
                            🔌 Select Test Device
                        </h3>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.95rem;">
                            Choose a device to execute your test scripts
                        </p>
                    </div>
                </div>
                
                <div class="device-modal-body" style="padding: 30px;">
                    <div style="margin-bottom: 20px;">
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 15px;
                        ">
                            <h4 style="margin: 0; color: #374151; font-size: 1.1rem;">Available Devices:</h4>
                            <button 
                                onclick="refreshDeviceStatus()" 
                                style="
                                    background: #f3f4f6;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    padding: 8px 12px;
                                    cursor: pointer;
                                    font-size: 0.85rem;
                                    color: #374151;
                                    transition: all 0.3s ease;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                "
                                onmouseover="this.style.background='#e5e7eb'"
                                onmouseout="this.style.background='#f3f4f6'"
                            >
                                🔄 Refresh Status
                            </button>
                        </div>
                        <div id="deviceList" style="
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            max-height: 400px;
                            overflow-y: auto;
                        ">
                            <!-- Device items will be populated here -->
                        </div>
                    </div>
                </div>
                
                <div class="device-modal-footer" style="
                    padding: 20px 30px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                    border-radius: 0 0 20px 20px;
                ">
                    <div style="font-size: 0.85rem; color: #6b7280;">
                        💡 Tip: Select an online device for best performance
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button 
                            onclick="closeDeviceSelectionModal()" 
                            style="
                                background: #e5e7eb;
                                color: #374151;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='#d1d5db'"
                            onmouseout="this.style.background='#e5e7eb'"
                        >
                            Cancel
                        </button>
                        <button 
                            id="confirmDeviceBtn"
                            onclick="confirmDeviceSelection()" 
                            disabled
                            style="
                                background: #9ca3af;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 8px;
                                cursor: not-allowed;
                                font-weight: 600;
                                opacity: 0.6;
                                transition: all 0.3s ease;
                            "
                        >
                            Continue with Selected Device
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .device-item {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .device-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
            
            .device-item.selected {
                border-color: #3b82f6 !important;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1)) !important;
            }
            
            .status-checking {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Populate device list
    populateDeviceList();

    console.log('✅ Device selection modal created');
}

function populateDeviceList() {
    const deviceList = document.getElementById('deviceList');
    if (!deviceList) return;

    deviceList.innerHTML = '';

    availableDevices.forEach((device, index) => {
        const deviceItem = document.createElement('div');
        deviceItem.className = 'device-item';
        deviceItem.id = `device-${device.id}`;
        deviceItem.style.cssText = `
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

        const statusIcon = getStatusIcon(device.status);
        const statusColor = getStatusColor(device.status);

        deviceItem.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                        font-size: 1.5rem;
                        width: 40px;
                        height: 40px;
                        background: ${statusColor}15;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid ${statusColor}40;
                    ">
                        ${statusIcon}
                    </div>
                    <div style="flex: 1;">
                        <div style="
                            font-weight: 600;
                            color: #1f2937;
                            font-size: 1rem;
                            margin-bottom: 4px;
                        ">${device.name}</div>
                        <div style="
                            color: #6b7280;
                            font-size: 0.85rem;
                            margin-bottom: 2px;
                        ">${device.host} • ${device.description || 'Test Device'}</div>
                        <div style="
                            font-size: 0.8rem;
                            color: ${statusColor};
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            <span style="
                                background: ${statusColor};
                                width: 6px;
                                height: 6px;
                                border-radius: 50%;
                                display: inline-block;
                            "></span>
                            ${device.status_message || device.status.toUpperCase()}
                        </div>
                    </div>
                </div>
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                ">
                    <button 
                        onclick="checkSingleDeviceStatus('${device.id}')"
                        style="
                            background: #f3f4f6;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            padding: 4px 8px;
                            cursor: pointer;
                            font-size: 0.75rem;
                            color: #374151;
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.background='#e5e7eb'"
                        onmouseout="this.style.background='#f3f4f6'"
                    >
                        Test Connection
                    </button>
                    <div style="
                        display: flex;
                        gap: 4px;
                        flex-wrap: wrap;
                        justify-content: flex-end;
                    ">
                        ${device.capabilities ? device.capabilities.map(cap => 
                            `<span style="
                                background: #eff6ff;
                                color: #1d4ed8;
                                padding: 2px 6px;
                                border-radius: 4px;
                                font-size: 0.7rem;
                                font-weight: 500;
                                border: 1px solid #bfdbfe;
                            ">${cap}</span>`
                        ).join('') : ''}
                    </div>
                </div>
            </div>
        `;

        // Add click handler for device selection
        deviceItem.addEventListener('click', (e) => {
            // Don't trigger selection if clicking the test button
            if (e.target.textContent === 'Test Connection') return;

            selectDevice(device.id);
        });

        deviceList.appendChild(deviceItem);
    });
}

function selectDevice(deviceId) {
    console.log(`🎯 Selecting device: ${deviceId}`);

    // Remove previous selection
    document.querySelectorAll('.device-item').forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = '#e5e7eb';
        item.style.background = 'white';
    });

    // Select new device
    const deviceItem = document.getElementById(`device-${deviceId}`);
    if (deviceItem) {
        deviceItem.classList.add('selected');
        deviceItem.style.borderColor = '#3b82f6';
        deviceItem.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))';
    }

    selectedDeviceId = deviceId;

    // Enable confirm button
    const confirmBtn = document.getElementById('confirmDeviceBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.opacity = '1';

        const selectedDevice = availableDevices.find(d => d.id === deviceId);
        if (selectedDevice) {
            confirmBtn.textContent = `Continue with ${selectedDevice.name}`;
        }
    }
}

async function checkSingleDeviceStatus(deviceId) {
    console.log(`🔍 Testing connection for device: ${deviceId}`);

    const deviceItem = document.getElementById(`device-${deviceId}`);
    if (!deviceItem) return;

    const statusElement = deviceItem.querySelector('[style*="font-size: 0.8rem"]');
    const iconElement = deviceItem.querySelector('[style*="font-size: 1.5rem"]');

    // Show checking state
    if (statusElement) {
        statusElement.innerHTML = `
            <span style="
                background: #3b82f6;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                display: inline-block;
                animation: pulse 1s infinite;
            "></span>
            Checking connection...
        `;
        statusElement.style.color = '#3b82f6';
    }

    if (iconElement) {
        iconElement.textContent = '🔄';
        iconElement.classList.add('status-checking');
    }

    try {
        const result = await checkDeviceStatus(deviceId);

        // Update device in availableDevices array
        const deviceIndex = availableDevices.findIndex(d => d.id === deviceId);
        if (deviceIndex !== -1) {
            availableDevices[deviceIndex] = {
                ...availableDevices[deviceIndex],
                status: result.status,
                status_message: result.message,
                is_online: result.is_online,
                last_checked: result.checked_at
            };
        }

        // Update UI
        const newStatusIcon = getStatusIcon(result.status);
        const newStatusColor = getStatusColor(result.status);

        if (statusElement) {
            statusElement.innerHTML = `
                <span style="
                    background: ${newStatusColor};
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                "></span>
                ${result.message}
            `;
            statusElement.style.color = newStatusColor;
        }

        if (iconElement) {
            iconElement.textContent = newStatusIcon;
            iconElement.classList.remove('status-checking');
            iconElement.parentElement.style.background = `${newStatusColor}15`;
            iconElement.parentElement.style.borderColor = `${newStatusColor}40`;
        }

        showToast(`Device test complete: ${result.message}`, result.is_online ? 'success' : 'warning');

    } catch (error) {
        console.error(`❌ Error testing device ${deviceId}:`, error);

        if (statusElement) {
            statusElement.innerHTML = `
                <span style="
                    background: #ef4444;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    display: inline-block;
                "></span>
                Connection test failed
            `;
            statusElement.style.color = '#ef4444';
        }

        if (iconElement) {
            iconElement.textContent = '❌';
            iconElement.classList.remove('status-checking');
        }

        showToast(`Device test failed: ${error.message}`, 'error');
    }
}

async function refreshDeviceStatus() {
    console.log('🔄 Refreshing all device statuses...');

    showToast('Refreshing device status...', 'info');

    try {
        const refreshedDevices = await loadAvailableDevices();
        if (refreshedDevices.length > 0) {
            populateDeviceList();
            showToast('Device status refreshed successfully', 'success');
        }
    } catch (error) {
        console.error('❌ Error refreshing devices:', error);
        showToast('Failed to refresh device status', 'error');
    }
}

function confirmDeviceSelection() {
    if (!selectedDeviceId) {
        showToast('Please select a device first', 'warning');
        return;
    }

    const selectedDevice = availableDevices.find(d => d.id === selectedDeviceId);
    if (!selectedDevice) {
        showToast('Selected device not found', 'error');
        return;
    }

    console.log(`✅ Device selection confirmed: ${selectedDevice.name}`);
    closeDeviceSelectionModal();

    // Show confirmation and proceed with execution
    showToast(`Selected device: ${selectedDevice.name} (${selectedDevice.status.toUpperCase()})`, 'success');

    // Call the actual execution function
    setTimeout(() => {
        executeCodeWithSelectedDevice();
    }, 500);
}

function closeDeviceSelectionModal() {
    const modal = document.getElementById('deviceSelectionModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    selectedDeviceId = null;
}

// ================================================================================================
// TEXT AREA MANAGEMENT
// ================================================================================================

function handleTextAreaInput() {
    updateCharCount();
    autoResizeTextarea();
}

function updateCharCount() {
    if (!elements.textArea || !elements.charCount) return;

    const count = elements.textArea.value.length;
    elements.charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function autoResizeTextarea() {
    if (!elements.textArea) return;

    elements.textArea.style.height = 'auto';
    elements.textArea.style.height = Math.max(180, elements.textArea.scrollHeight) + 'px';
}

function updateTestAreaCharCount(index) {
    const textarea = document.getElementById(`testArea${index}`);
    const charCount = document.getElementById(`charCount${index}`);

    if (textarea && charCount) {
        const count = textarea.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }
}

function autoResizeTestTextarea(index) {
    const textarea = document.getElementById(`testArea${index}`);
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(250, textarea.scrollHeight) + 'px';
    }
}

// ================================================================================================
// MULTI-TEST AREA MANAGEMENT
// ================================================================================================
// 2. UPDATED: Master control panel without Smart Select button
function createMultiTestAreas() {
    // FIXED: Only create multi-test areas if there are MULTIPLE scripts
    if (!generatedScripts || generatedScripts.length <= 1) {
        console.log('🏗️ Single or no test case - using single test area mode');

        // For single test case, make sure execute button is properly set
        updateExecuteButtonState();

        // Make sure single text area is visible
        const singleTextAreaContainer = document.querySelector('.text-area-container');
        if (singleTextAreaContainer) {
            singleTextAreaContainer.style.display = 'block';
        }

        return;
    }

    // Rest of your existing createMultiTestAreas() function stays exactly the same...
    console.log('🏗️ Creating multi-test areas for', generatedScripts.length, 'scripts');

    //const autoTestContent = document.getElementById('autoTestContent');
    const autoTestContent = document.getElementById('qaContent');

    if (!autoTestContent) {
        console.error('❌ AutoTest content area not found!');
        return;
    }

    // Remove existing multi-test areas
    const existingMultiAreas = document.getElementById('multiTestAreas');
    if (existingMultiAreas) {
        existingMultiAreas.remove();
    }

    // Create new multi-test areas container
    const multiTestAreas = document.createElement('div');
    multiTestAreas.id = 'multiTestAreas';
    multiTestAreas.className = 'multi-test-areas';
    multiTestAreas.style.marginBottom = '25px';

    // ✨ CLEANED UP: Master Control Panel without Smart Select
    const masterControlPanel = document.createElement('div');
    masterControlPanel.id = 'masterControlPanel';
    masterControlPanel.className = 'master-control-panel';
    masterControlPanel.style.cssText = `
        background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        border: 2px solid #0ea5e9;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 25px;
        display: none;
        box-shadow: 0 4px 15px rgba(14, 165, 233, 0.15);
        animation: slideInFromTop 0.5s ease-out;
    `;

    masterControlPanel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <!-- Master Checkbox -->
                <div style="
                    background: white;
                    border: 2px solid #0ea5e9;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
                ">
                    <input 
                        type="checkbox" 
                        id="masterExecuteCheckbox" 
                        checked 
                        onchange="toggleAllTests(this.checked)"
                        style="
                            width: 20px;
                            height: 20px;
                            accent-color: #0ea5e9;
                            cursor: pointer;
                        "
                    >
                    <label for="masterExecuteCheckbox" style="
                        font-weight: 600;
                        color: #0c4a6e;
                        cursor: pointer;
                        font-size: 1rem;
                        margin: 0;
                    ">
                        Select All Tests for Execution
                    </label>
                </div>
                
                <!-- Test Count Display -->
                <div id="testCountDisplay" style="
                    background: #0ea5e9;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
                ">
                    ${generatedScripts.length} Tests Total
                </div>
            </div>
        </div>
    `;

    multiTestAreas.appendChild(masterControlPanel);

    // Initialize all test cases as selected by default
    selectedTestCases.clear();
    generatedScripts.forEach(script => {
        selectedTestCases.add(script.id);
    });

    // Create test areas for each generated script
    generatedScripts.forEach((script, index) => {
        const testAreaGroup = document.createElement('div');
        testAreaGroup.className = 'test-area-group';
        testAreaGroup.style.cssText = `
            margin-bottom: 30px;
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.9);
            transition: all 0.3s ease;
        `;

        testAreaGroup.innerHTML = `
            <div class="test-area-header" style="
                background: linear-gradient(135deg, #1e40af, #3b82f6);
                color: white;
                padding: 15px 20px;
                font-weight: 600;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- Individual Execution Checkbox -->
                    <div class="execution-checkbox-container" style="
                        display: none;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        padding: 8px 12px;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        backdrop-filter: blur(10px);
                    " id="checkboxContainer${index}">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem;">
                            <input 
                                type="checkbox" 
                                id="executeCheckbox${index}" 
                                checked 
                                onchange="toggleTestSelection(${script.id}, this.checked)"
                                style="
                                    width: 18px;
                                    height: 18px;
                                    accent-color: #22c55e;
                                    cursor: pointer;
                                "
                            >
                            <span style="color: white; font-weight: 500;">Execute this test</span>
                        </label>
                    </div>
                    <span>Test Case ${script.id}: ${script.test_case_name}</span>
                </div>
                <div style="
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                ">${script.id}</div>
            </div>
            <div class="test-area-content" style="position: relative;">
                <textarea 
                    class="test-area-textarea" 
                    id="testArea${index}"
                    placeholder="Content for ${script.test_case_name} will appear here..."
                    oninput="updateTestAreaCharCount(${index}); autoResizeTestTextarea(${index})"
                    style="
                        width: 100%;
                        min-height: 250px;
                        padding: 20px;
                        border: none;
                        font-family: 'Courier New', monospace;
                        font-size: 0.9rem;
                        resize: vertical;
                        background: white;
                        color: #374151;
                        border-radius: 0 0 13px 13px;
                    "
                ></textarea>
                <div class="test-area-char-count" id="charCount${index}" style="
                    position: absolute;
                    bottom: 12px;
                    right: 18px;
                    color: #6b7280;
                    font-size: 0.8rem;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                ">0 characters</div>
                <div class="test-area-actions" style="
                    position: absolute;
                    top: 12px;
                    right: 18px;
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                ">
                    <button class="action-btn save-btn" onclick="saveTestCode(${index})" title="Save code" style="
                        width: 36px;
                        height: 36px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        background: #22c55e;
                        color: white;
                        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                    ">
                        💾
                    </button>
                    <button class="action-btn download-btn" onclick="downloadTestCode(${index})" title="Download code" style="
                        width: 36px;
                        height: 36px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        background: #3b82f6;
                        color: white;
                        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                    ">
                        📥
                    </button>
                </div>
            </div>
        `;
        multiTestAreas.appendChild(testAreaGroup);
    });

    autoTestContent.appendChild(multiTestAreas);

    // Hide single text area only when showing multi-test areas
    const singleTextAreaContainer = document.querySelector('.text-area-container');
    if (singleTextAreaContainer) {
        singleTextAreaContainer.style.display = 'none';
    }

    console.log('✅ Multi-test areas created successfully with clean master control panel');
}

// ================================================================================================
// BULK DOWNLOAD FUNCTIONALITY - ADD THESE FUNCTIONS TO YOUR SCRIPT.JS
// ================================================================================================

// Global variable to track selected scripts for bulk download
let selectedScriptsForDownload = new Set();

// Function to create bulk download controls
function createBulkDownloadControls() {
    console.log('🗂️ Creating bulk download controls in header area');

    if (!generatedScripts || generatedScripts.length <= 1) {
        console.log('🚫 Not creating bulk controls - single or no scripts');
        return;
    }

    // Remove existing bulk controls
    const existingControls = document.getElementById('bulkDownloadControls');
    if (existingControls) {
        existingControls.remove();
    }

    // Create bulk download controls container
    const bulkControls = document.createElement('div');
    bulkControls.id = 'bulkDownloadControls';
    bulkControls.className = 'bulk-download-controls';
    bulkControls.style.cssText = `
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border: 2px solid #64748b;
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        display: none;
        box-shadow: 0 4px 15px rgba(100, 116, 139, 0.15);
        animation: slideInFromTop 0.5s ease-out;
        position: relative;
        z-index: 10;
    `;

    bulkControls.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <!-- Master Download Checkbox -->
                <div style="
                    background: white;
                    border: 2px solid #64748b;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 2px 8px rgba(100, 116, 139, 0.1);
                ">
                    <input 
                        type="checkbox" 
                        id="masterDownloadCheckbox" 
                        checked 
                        onchange="toggleAllScriptsForDownload(this.checked)"
                        style="
                            width: 20px;
                            height: 20px;
                            accent-color: #64748b;
                            cursor: pointer;
                        "
                    >
                    <label for="masterDownloadCheckbox" style="
                        font-weight: 600;
                        color: #334155;
                        cursor: pointer;
                        font-size: 1rem;
                        margin: 0;
                    ">
                        Select All Scripts for Download
                    </label>
                </div>
                
                <!-- Download Count Display -->
                <div id="downloadCountDisplay" style="
                    background: #64748b;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
                ">
                    ${generatedScripts.length} Scripts Selected
                </div>
            </div>
            
            <!-- Download Actions -->
            <div style="display: flex; gap: 10px;">
                <button 
                    id="downloadSelectedBtn" 
                    onclick="downloadSelectedScripts()" 
                    style="
                        background: linear-gradient(135deg, #059669, #10b981);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 3px 8px rgba(16, 185, 129, 0.3);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    "
                    onmouseover="this.style.background='linear-gradient(135deg, #047857, #059669)'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.background='linear-gradient(135deg, #059669, #10b981)'; this.style.transform='translateY(0)'"
                >
                    📦 Download as ZIP
                </button>
                
                <button 
                    onclick="hideBulkDownloadControls()" 
                    style="
                        background: #e2e8f0;
                        color: #475569;
                        border: 1px solid #cbd5e1;
                        padding: 10px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.background='#cbd5e1'"
                    onmouseout="this.style.background='#e2e8f0'"
                >
                    ✕ Close
                </button>
            </div>
        </div>
        
        <!-- Selected Scripts Summary -->
        <div id="selectedScriptsSummary" style="
            margin-top: 15px;
            padding: 12px 15px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            font-size: 0.85rem;
            color: #475569;
            display: none;
        ">
            <strong>Selected for download:</strong> <span id="selectedScriptsList">All scripts</span>
        </div>
    `;

    // *** CHANGED: Insert after buttons instead of at end of multiTestAreas ***
    const buttonsContainer = document.querySelector('.buttons');
    if (buttonsContainer && buttonsContainer.parentNode) {
        // Insert right after the buttons container
        buttonsContainer.parentNode.insertBefore(bulkControls, buttonsContainer.nextSibling);
        console.log('✅ Bulk controls inserted after main buttons');
    } else {
        // Fallback: insert before multiTestAreas if buttons not found
        const multiTestAreas = document.getElementById('multiTestAreas');
        if (multiTestAreas && multiTestAreas.parentNode) {
            multiTestAreas.parentNode.insertBefore(bulkControls, multiTestAreas);
            console.log('✅ Bulk controls inserted before multi-test areas (fallback)');
        }
    }

    // Initialize all scripts as selected
    selectedScriptsForDownload.clear();
    generatedScripts.forEach(script => {
        selectedScriptsForDownload.add(script.id);
    });

    // Add individual checkboxes to each test area
    addIndividualDownloadCheckboxes();

    console.log('✅ Bulk download controls created successfully in header area');
}

// Function to add individual download checkboxes to test areas
function addIndividualDownloadCheckboxes() {
    console.log('📋 Adding individual download checkboxes');

    generatedScripts.forEach((script, index) => {
        const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
        if (testHeader) {
            // Remove existing download checkbox if present
            const existingCheckbox = testHeader.querySelector('.download-checkbox-container');
            if (existingCheckbox) {
                existingCheckbox.remove();
            }

            // Create download checkbox container
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'download-checkbox-container';
            checkboxContainer.style.cssText = `
                display: none;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 8px;
                padding: 6px 10px;
                border: 1px solid rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(10px);
                margin-left: auto;
                margin-right: 50px;
            `;

            checkboxContainer.innerHTML = `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                    <input 
                        type="checkbox" 
                        id="downloadCheckbox${index}" 
                        checked 
                        onchange="toggleScriptForDownload(${script.id}, this.checked)"
                        style="
                            width: 16px;
                            height: 16px;
                            accent-color: #10b981;
                            cursor: pointer;
                        "
                    >
                    <span style="color: white; font-weight: 500;">Include in ZIP</span>
                </label>
            `;

            testHeader.appendChild(checkboxContainer);
        }
    });
}

// Function to show bulk download controls
function showBulkDownloadControlsCompact() {
    console.log('👁️ Showing compact bulk download controls');

    const bulkControls = document.getElementById('bulkDownloadControls');
    if (bulkControls) {
        bulkControls.style.display = 'block';
    }

    // Show individual checkboxes
    generatedScripts.forEach((script, index) => {
        const checkboxContainer = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .download-checkbox-container`);
        if (checkboxContainer) {
            checkboxContainer.style.display = 'block';
        }
    });

    // Hide the show button
    const showButton = document.getElementById('showBulkDownloadBtn');
    if (showButton) {
        showButton.style.display = 'none';
    }

    updateDownloadSelectionSummary();
}

// Function to hide bulk download controls
function hideBulkDownloadControls() {
    console.log('🙈 Hiding bulk download controls');

    const bulkControls = document.getElementById('bulkDownloadControls');
    if (bulkControls) {
        bulkControls.style.display = 'none';
    }

    // Hide individual checkboxes
    generatedScripts.forEach((script, index) => {
        const checkboxContainer = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .download-checkbox-container`);
        if (checkboxContainer) {
            checkboxContainer.style.display = 'none';
        }
    });

    // Show the show button again
    const showButton = document.getElementById('showBulkDownloadBtn');
    if (showButton) {
        showButton.style.display = 'flex';
    }
}

// NEW: Create compact bulk download trigger button in header
function createCompactBulkDownloadButton() {
    console.log('🎯 Creating compact bulk download button in header');

    if (!generatedScripts || generatedScripts.length <= 1) {
        return;
    }

    // Remove existing button
    const existingButton = document.getElementById('compactBulkDownloadBtn');
    if (existingButton) {
        existingButton.remove();
    }

    // Create compact button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'compactBulkDownloadContainer';
    buttonContainer.className = 'compact-bulk-download-container';
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: center;
        margin: 15px 0;
        animation: fadeInUp 0.5s ease-out;
    `;

    buttonContainer.innerHTML = `
        <button 
            id="compactBulkDownloadBtn" 
            onclick="showBulkDownloadControlsCompact()" 
            style="
                background: linear-gradient(135deg, #64748b, #475569);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
                overflow: hidden;
            "
            onmouseover="this.style.background='linear-gradient(135deg, #475569, #334155)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='linear-gradient(135deg, #64748b, #475569)'; this.style.transform='translateY(0)'"
        >
            📁 Bulk Download Options (${generatedScripts.length} scripts)
        </button>
    `;

    // Insert right after the main buttons
    const buttonsContainer = document.querySelector('.buttons');
    if (buttonsContainer && buttonsContainer.parentNode) {
        buttonsContainer.parentNode.insertBefore(buttonContainer, buttonsContainer.nextSibling);
        console.log('✅ Compact bulk download button created in header');
    }
}

function addBulkDownloadToMultiTestAreas() {
    if (generatedScripts.length > 1) {
        createBulkDownloadControls();
        createCompactBulkDownloadButton();
        console.log('✅ Bulk download components added to header area');
    }
}

// Function to toggle all scripts for download
function toggleAllScriptsForDownload(isChecked) {
    console.log(`🎛️ Master download toggle: ${isChecked ? 'Selecting' : 'Deselecting'} all scripts`);

    if (isChecked) {
        // Select all scripts
        selectedScriptsForDownload.clear();
        generatedScripts.forEach(script => {
            selectedScriptsForDownload.add(script.id);
        });
    } else {
        // Deselect all scripts
        selectedScriptsForDownload.clear();
    }

    // Update individual checkboxes
    generatedScripts.forEach((script, index) => {
        const checkbox = document.getElementById(`downloadCheckbox${index}`);
        if (checkbox) {
            checkbox.checked = isChecked;
        }
    });

    updateDownloadCountDisplay();
    updateDownloadSelectionSummary();
    updateDownloadButtonState();
}

// Function to toggle individual script for download
function toggleScriptForDownload(scriptId, isSelected) {
    console.log(`🎯 Script ${scriptId} download selection: ${isSelected}`);

    if (isSelected) {
        selectedScriptsForDownload.add(scriptId);
    } else {
        selectedScriptsForDownload.delete(scriptId);
    }

    updateMasterDownloadCheckbox();
    updateDownloadCountDisplay();
    updateDownloadSelectionSummary();
    updateDownloadButtonState();
}

// Function to update master download checkbox
function updateMasterDownloadCheckbox() {
    const masterCheckbox = document.getElementById('masterDownloadCheckbox');
    if (!masterCheckbox) return;

    const totalScripts = generatedScripts.length;
    const selectedCount = selectedScriptsForDownload.size;

    if (selectedCount === 0) {
        masterCheckbox.checked = false;
        masterCheckbox.indeterminate = false;
    } else if (selectedCount === totalScripts) {
        masterCheckbox.checked = true;
        masterCheckbox.indeterminate = false;
    } else {
        masterCheckbox.checked = false;
        masterCheckbox.indeterminate = true;
    }
}

// Function to update download count display
function updateDownloadCountDisplay() {
    const countDisplay = document.getElementById('downloadCountDisplay');
    if (!countDisplay) return;

    const selectedCount = selectedScriptsForDownload.size;
    const totalCount = generatedScripts.length;

    if (selectedCount === totalCount) {
        countDisplay.textContent = `All ${totalCount} Scripts Selected`;
        countDisplay.style.background = '#10b981';
    } else if (selectedCount === 0) {
        countDisplay.textContent = `No Scripts Selected (${totalCount} Available)`;
        countDisplay.style.background = '#ef4444';
    } else {
        countDisplay.textContent = `${selectedCount} of ${totalCount} Scripts Selected`;
        countDisplay.style.background = '#f59e0b';
    }
}

// Function to update download selection summary
function updateDownloadSelectionSummary() {
    const summary = document.getElementById('selectedScriptsSummary');
    const scriptsList = document.getElementById('selectedScriptsList');

    if (!summary || !scriptsList) return;

    const selectedCount = selectedScriptsForDownload.size;
    const totalCount = generatedScripts.length;

    if (selectedCount === 0) {
        summary.style.display = 'none';
    } else {
        summary.style.display = 'block';

        if (selectedCount === totalCount) {
            scriptsList.textContent = 'All scripts';
        } else {
            const selectedScriptNames = generatedScripts
                .filter(script => selectedScriptsForDownload.has(script.id))
                .map(script => script.script_name)
                .join(', ');
            scriptsList.textContent = selectedScriptNames;
        }
    }
}

// Function to update download button state
function updateDownloadButtonState() {
    const downloadBtn = document.getElementById('downloadSelectedBtn');
    if (!downloadBtn) return;

    const selectedCount = selectedScriptsForDownload.size;

    if (selectedCount === 0) {
        downloadBtn.disabled = true;
        downloadBtn.textContent = '📦 Select Scripts First';
        downloadBtn.style.opacity = '0.6';
        downloadBtn.style.cursor = 'not-allowed';
    } else {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `📦 Download ${selectedCount} Script${selectedCount > 1 ? 's' : ''} as ZIP`;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.cursor = 'pointer';
    }
}

// REPLACE your existing downloadSelectedScripts function with this fixed version:
async function downloadSelectedScripts() {
    console.log('📦 Starting bulk download of selected scripts');

    const selectedCount = selectedScriptsForDownload.size;

    if (selectedCount === 0) {
        showToast('Please select at least one script to download!', 'warning');
        return;
    }

    const downloadBtn = document.getElementById('downloadSelectedBtn');
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = `<div class="spinner"></div> Creating ZIP...`;
    }

    try {
        // Show progress
        showProgress('Creating Download Package', [
            'Collecting selected scripts',
            'Creating ZIP package',
            'Preparing download'
        ]);

        updateProgress(25, 'Collecting selected scripts', 0);
        await delay(500);

        updateProgress(50, 'Creating ZIP package', 1);

        // Get selected script IDs as array
        const selectedScriptIds = Array.from(selectedScriptsForDownload);

        console.log('📦 Selected script IDs:', selectedScriptIds);

        // Make API call to create ZIP
        const response = await fetch('/download_all_scripts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_script_ids: selectedScriptIds
            })
        });

        const result = await response.json();
        console.log('📦 ZIP creation result:', result);

        updateProgress(75, 'Preparing download', 2);
        await delay(500);

        if (result.success) {
            updateProgress(100, 'Download ready', 2);

            console.log('📦 Creating download with temp filename:', result.temp_filename);

            // Create download link using the temp filename (not full path)
            const downloadUrl = `/download_zip/${result.temp_filename}`;
            console.log('📦 Download URL:', downloadUrl);

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = result.download_filename;
            downloadLink.style.display = 'none';

            document.body.appendChild(downloadLink);

            // Trigger download
            downloadLink.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(downloadLink);
            }, 1000);

            showToast(`Successfully created ZIP package with ${result.script_count} scripts!`, 'success');

            // Reset download controls after successful download
            setTimeout(() => {
                hideBulkDownloadControls();
            }, 3000);

        } else {
            console.error('❌ ZIP creation failed:', result.message);
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Bulk download error:', error);
        showToast('Failed to create download package: ' + error.message, 'error');
    } finally {
        // Reset button
        if (downloadBtn) {
            downloadBtn.disabled = false;
            updateDownloadButtonState();
        }
        hideProgress();
    }
}

// 2. NEW: Master checkbox toggle function
function toggleAllTests(isChecked) {
    console.log(`🎛️ Master toggle: ${isChecked ? 'Selecting' : 'Deselecting'} all tests`);

    if (isChecked) {
        selectAllTests();
    } else {
        deselectAllTests();
    }

    // Update master checkbox appearance
    updateMasterCheckbox();
}


// 3. ADD NEW FUNCTIONS for checkbox management
function toggleTestSelection(testCaseId, isSelected) {
    console.log(`🎯 Test case ${testCaseId} selection toggled: ${isSelected}`);

    if (isSelected) {
        selectedTestCases.add(testCaseId);
    } else {
        selectedTestCases.delete(testCaseId);
    }

    updateExecuteButtonState();
    updateSelectionSummary();
    updateMasterCheckbox(); // NEW: Update master checkbox state

    console.log(`📋 Selected test cases: [${Array.from(selectedTestCases).join(', ')}]`);
}

// 4. NEW: Update master checkbox based on individual selections
function updateMasterCheckbox() {
    const masterCheckbox = document.getElementById('masterExecuteCheckbox');
    if (!masterCheckbox) return;

    const totalTests = generatedScripts.length;
    const selectedCount = selectedTestCases.size;

    if (selectedCount === 0) {
        masterCheckbox.checked = false;
        masterCheckbox.indeterminate = false;
    } else if (selectedCount === totalTests) {
        masterCheckbox.checked = true;
        masterCheckbox.indeterminate = false;
    } else {
        masterCheckbox.checked = false;
        masterCheckbox.indeterminate = true; // Partial selection
    }

    // Update test count display
    const testCountDisplay = document.getElementById('testCountDisplay');
    if (testCountDisplay) {
        if (selectedCount === totalTests) {
            testCountDisplay.textContent = `All ${totalTests} Tests Selected`;
            testCountDisplay.style.background = '#22c55e';
        } else if (selectedCount === 0) {
            testCountDisplay.textContent = `No Tests Selected (${totalTests} Available)`;
            testCountDisplay.style.background = '#ef4444';
        } else {
            testCountDisplay.textContent = `${selectedCount} of ${totalTests} Tests Selected`;
            testCountDisplay.style.background = '#f59e0b';
        }
    }
}

function updateExecuteButtonState() {
    const executeBtn = document.getElementById('executeBtn');
    if (!executeBtn) return;

    if (!generatedScripts || generatedScripts.length === 0) {
        // No scripts available
        executeBtn.disabled = true;
        executeBtn.textContent = 'Execute Code';
        executeBtn.classList.remove('selective-execution');
        return;
    }

    if (generatedScripts.length === 1) {
        // Single test case: always enabled, simple text
        executeBtn.disabled = false;
        executeBtn.textContent = 'Execute Code';
        executeBtn.classList.remove('selective-execution');
        console.log('🔘 Execute button: Single test mode');
    } else {
        // Multiple test cases: selection-based
        const selectedCount = selectedTestCases.size;
        const totalCount = generatedScripts.length;

        if (selectedCount === 0) {
            executeBtn.disabled = true;
            executeBtn.textContent = 'Execute Code (Select Tests First)';
            executeBtn.classList.add('selective-execution');
        } else if (selectedCount === totalCount) {
            executeBtn.disabled = false;
            executeBtn.textContent = 'Execute All Tests';
            executeBtn.classList.add('selective-execution');
        } else {
            executeBtn.disabled = false;
            executeBtn.textContent = `Execute Selected Tests (${selectedCount}/${totalCount})`;
            executeBtn.classList.add('selective-execution');
        }

        console.log(`🔘 Execute button: Multi-test mode (${selectedCount}/${totalCount} selected)`);
    }
}

// 1. UPDATED: Clean selection summary without redundant buttons
function updateSelectionSummary() {
    const selectedCount = selectedTestCases.size;
    const totalCount = generatedScripts ? generatedScripts.length : 0;

    // Remove any existing selection summary
    const existingSummary = document.getElementById('selectionSummary');
    if (existingSummary) {
        existingSummary.remove();
    }

    // Only show summary if we have tests and some are selected
    if (totalCount === 0) return;

    // Create clean selection summary without buttons
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'selectionSummary';
    summaryDiv.className = 'selection-summary';

    // Simple, clean summary without redundant buttons
    summaryDiv.innerHTML = `
        <div class="selection-summary-info">
            <div class="selection-count-badge">${selectedCount}</div>
            <div>
                <div class="selection-text">${selectedCount} of ${totalCount} tests selected for execution</div>
                <div class="selection-details">Selected: Test Cases ${Array.from(selectedTestCases).sort((a, b) => a - b).join(', ')}</div>
            </div>
        </div>
    `;

    // Insert before the execute button
    const executeBtn = document.getElementById('executeBtn');
    if (executeBtn && executeBtn.parentNode) {
        executeBtn.parentNode.insertBefore(summaryDiv, executeBtn.parentNode.querySelector('.buttons'));
    }

    console.log(`📊 Selection summary updated: ${selectedCount}/${totalCount} tests selected`);
}

// 5. ENHANCED: Select all with master checkbox update
function selectAllTests() {
    console.log('✅ Selecting all tests');

    generatedScripts.forEach((script, index) => {
        selectedTestCases.add(script.id);
        const checkbox = document.getElementById(`executeCheckbox${index}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    updateExecuteButtonState();
    updateSelectionSummary();
    updateMasterCheckbox();
}

// 6. ENHANCED: Deselect all with master checkbox update
function deselectAllTests() {
    console.log('❌ Deselecting all tests');

    selectedTestCases.clear();

    generatedScripts.forEach((script, index) => {
        const checkbox = document.getElementById(`executeCheckbox${index}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });

    updateExecuteButtonState();
    updateSelectionSummary();
    updateMasterCheckbox();
}

// 7. NEW: Smart selection based on review results (placeholder logic)
/*
function selectRecommended() {
    console.log('⭐ Smart selecting recommended tests');

    // Clear current selection
    selectedTestCases.clear();

    // Smart logic: Select tests that don't have obvious error indicators
    generatedScripts.forEach((script, index) => {
        const textarea = document.getElementById(`testArea${index}`);
        const content = textarea ? textarea.value.toLowerCase() : '';

        // Simple heuristic: avoid tests with error indicators
        const hasErrors = content.includes('[fail]') ||
                         content.includes('error:') ||
                         content.includes('critical') ||
                         content.includes('security vulnerability') ||
                         content.includes('static code analysis fails');

        const checkbox = document.getElementById(`executeCheckbox${index}`);
        if (checkbox) {
            if (!hasErrors || content.includes('[pass]')) {
                selectedTestCases.add(script.id);
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        }
    });

    updateExecuteButtonState();
    updateSelectionSummary();
    updateMasterCheckbox();

    const selectedCount = selectedTestCases.size;
    const totalCount = generatedScripts.length;
    const skippedCount = totalCount - selectedCount;

    if (skippedCount > 0) {
        showToast(`Smart selection: Selected ${selectedCount} tests, skipped ${skippedCount} tests with potential issues`, 'warning');
    } else {
        showToast(`Smart selection: All ${selectedCount} tests look good for execution!`, 'success');
    }
}
*/
// 8. ENHANCED: Show checkboxes with master control panel
function showExecutionCheckboxes() {
    console.log('👁️ Showing execution checkboxes and master control panel');

    // Show master control panel
    const masterControlPanel = document.getElementById('masterControlPanel');
    if (masterControlPanel) {
        masterControlPanel.style.display = 'block';
    }

    // Show individual checkboxes
    generatedScripts.forEach((script, index) => {
        const checkboxContainer = document.getElementById(`checkboxContainer${index}`);
        if (checkboxContainer) {
            checkboxContainer.style.display = 'block';
        }
    });

    updateExecuteButtonState();
    updateSelectionSummary();
    updateMasterCheckbox();
}

// 9. ENHANCED: Hide checkboxes with master control panel
function hideExecutionCheckboxes() {
    console.log('🙈 Hiding execution checkboxes and master control panel');

    // Hide master control panel
    const masterControlPanel = document.getElementById('masterControlPanel');
    if (masterControlPanel) {
        masterControlPanel.style.display = 'none';
    }

    // Hide individual checkboxes
    generatedScripts.forEach((script, index) => {
        const checkboxContainer = document.getElementById(`checkboxContainer${index}`);
        if (checkboxContainer) {
            checkboxContainer.style.display = 'none';
        }
    });

    // Remove selection summary
    const existingSummary = document.getElementById('selectionSummary');
    if (existingSummary) {
        existingSummary.remove();
    }
}


function areCheckboxesVisible() {
    if (generatedScripts.length === 0) return false;

    const firstCheckboxContainer = document.getElementById('checkboxContainer0');
    return firstCheckboxContainer && firstCheckboxContainer.style.display !== 'none';
}

function hideMultiTestAreas() {
    console.log('🗑️ Hiding multi-test areas');

    const multiTestAreas = document.getElementById('multiTestAreas');
    if (multiTestAreas) {
        multiTestAreas.remove();
    }

    // Show single text area
    const singleTextAreaContainer = document.querySelector('.text-area-container');
    if (singleTextAreaContainer) {
        singleTextAreaContainer.style.display = 'block';
    }
}

// ================================================================================================
// MAIN FUNCTIONALITY - INGEST TEST (UPDATED TO HANDLE PYTHON FILES)
// ================================================================================================

async function ingestTest() {
    console.log('📥 Starting test ingestion...');

    if (uploadedFiles.length === 0) {
        showToast('Please upload files first!', 'warning');
        return;
    }

    const ingestBtn = document.getElementById('ingestBtn');
    if (!ingestBtn) return;

    ingestBtn.disabled = true;
    ingestBtn.textContent = 'Ingesting...';

    try {
        showProgress('Ingesting Test Data', [
            'Reading uploaded files',
            'Parsing file contents',
            'Extracting test requirements',
            'Generating test metadata'
        ]);

        updateProgress(25, 'Reading uploaded files', 0);
        await delay(500);

        updateProgress(50, 'Parsing file contents', 1);
        await delay(700);

        updateProgress(75, 'Extracting test requirements', 2);

        const response = await fetch('/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: uploadedFiles })
        });

        const result = await response.json();
        console.log('📊 Ingestion result:', result);

        updateProgress(100, 'Test data ingested successfully', 3);

        if (result.success) {
            // Store ingested test cases
            ingestedTestCases = result.processed_files;

            // NEW: Handle different workflow types
            const workflowType = result.workflow_type;
            console.log(`🔄 Detected workflow type: ${workflowType}`);

            if (elements.textArea) {
                let textAreaContent = `Ingestion completed!\n\nFiles processed: ${uploadedFiles.length}\nItems found: ${result.total_test_cases}\n\n`;

                // NEW: Different messages based on file types
                if (result.python_files && result.python_files.length > 0) {
                    textAreaContent += `Python Code Files:\n`;
                    result.python_files.forEach(py => {
                        textAreaContent += `- ${py.original_name} → ${py.script_name}\n`;
                    });
                    textAreaContent += `\nPython files are ready for code review.\n`;
                }

                if (result.processed_files) {
                    const testCaseFiles = result.processed_files.filter(f => f.file_type !== 'python_code');
                    if (testCaseFiles.length > 0) {
                        textAreaContent += `\nTest Case Files:\n`;
                        testCaseFiles.forEach(f => {
                            textAreaContent += `- ${f.name}: ${f.test_cases}\n`;
                        });
                        textAreaContent += `\nTest cases are ready for Python code generation.\n`;
                    }
                }

                elements.textArea.value = textAreaContent;
                updateCharCount();
                autoResizeTextarea();
            }

            // NEW: Set button states based on workflow type
            const generateBtn = document.getElementById('generateBtn');
            const reviewBtn = document.getElementById('reviewBtn');
            const executeBtn = document.getElementById('executeBtn');

            if (workflowType === 'python_code') {
                // Python files uploaded - skip generate, enable review
                console.log('🐍 Python workflow: Skip generate, enable review');

                if (generateBtn) {
                    generateBtn.disabled = true;
                    generateBtn.textContent = 'Code Already Available ✓';
                    generateBtn.style.opacity = '0.6';
                    generateBtn.style.cursor = 'not-allowed';
                }

                if (reviewBtn) {
                    reviewBtn.disabled = false;
                    reviewBtn.style.opacity = '1';
                    reviewBtn.style.cursor = 'pointer';
                }

                if (executeBtn) {
                    executeBtn.disabled = true;
                    executeBtn.style.opacity = '0.6';
                    executeBtn.style.cursor = 'not-allowed';
                }

                // NEW: Populate generatedScripts for Python files (matching the structure expected by review code)
                generatedScripts = result.processed_files
                    .filter(file => file.file_type === 'python_code')
                    .map((processedFile) => {
                        // Find the corresponding python file data
                        const pyFile = result.python_files.find(pf => pf.original_name === processedFile.original_filename);
                        return {
                            id: processedFile.id,  // Use the processed file ID from backend
                            script_name: processedFile.script_filename || pyFile.script_name,
                            test_case_name: processedFile.name,
                            file_path: pyFile.dest_path,
                            code: pyFile.full_content
                        };
                    });

                // Create multi test areas for Python files if needed
                if (generatedScripts.length > 1) {
                    createMultiTestAreas();

                    // NEW: Populate each textarea with the Python code
                    generatedScripts.forEach((script, index) => {
                        const textarea = document.getElementById(`testArea${index}`);
                        if (textarea) {
                            textarea.value = script.code;
                            updateTestAreaCharCount(index);
                            autoResizeTestTextarea(index);
                        }
                    });
                } else if (generatedScripts.length === 1) {
                    // Single Python file - update main text area
                    if (elements.textArea) {
                        elements.textArea.value = generatedScripts[0].code;
                        updateCharCount();
                        autoResizeTextarea();
                        if (elements.codeActions) elements.codeActions.classList.add('show');
                    }
                }

                showToast(`${result.python_files.length} Python file(s) ready for review - Code generation skipped!`, 'success');

            } else if (workflowType === 'test_cases') {
                // Test case files uploaded - enable generate (normal workflow)
                console.log('📝 Test case workflow: Enable generate');

                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.style.opacity = '1';
                    generateBtn.style.cursor = 'pointer';
                }

                if (reviewBtn) {
                    reviewBtn.disabled = true;
                    reviewBtn.style.opacity = '0.6';
                    reviewBtn.style.cursor = 'not-allowed';
                }

                if (executeBtn) {
                    executeBtn.disabled = true;
                    executeBtn.style.opacity = '0.6';
                    executeBtn.style.cursor = 'not-allowed';
                }

                showToast(result.message, 'success');

            } else if (workflowType === 'mixed') {
                // Mixed files - show warning
                console.log('⚠️ Mixed workflow: Both Python and test case files detected');

                if (generateBtn) {
                    generateBtn.disabled = true;
                    generateBtn.textContent = 'Mixed File Types Detected';
                    generateBtn.style.opacity = '0.6';
                    generateBtn.style.cursor = 'not-allowed';
                }

                showToast('Mixed file types detected. Please upload either test case files OR Python code files, not both.', 'warning');
            }

        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Ingestion error:', error);
        showToast('Ingestion failed: ' + error.message, 'error');
    } finally {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Test';
        hideProgress();
    }
}

// ================================================================================================
// MAIN FUNCTIONALITY - GENERATE CODE (WITH REAL PROGRESS)
// ================================================================================================

async function generateCode() {
    console.log('🔧 Starting code generation...');

    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;

    generateBtn.disabled = true;
    generateBtn.classList.add('btn-loading');

    try {
        // Start real progress tracking
        startRealProgress('generate', 'Generating Python Test Code', [
            'Analyzing test requirements',
            'Creating Python test structure',
            'Generating Python Code',
            'Optimizing Python code',
            'Finalizing test suite'
        ]);

        // Make the actual API call
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input_text: elements.textArea ? elements.textArea.value : '' })
        });

        const result = await response.json();
        console.log('🐍 Generation result:', result);

        if (result.success) {
            // Store generated scripts
            generatedScripts = result.generated_scripts;

            // Create multi test areas OR show single area
            if (generatedScripts.length > 1) {
                createMultiTestAreas();
                //createBulkDownloadControls();
                addBulkDownloadToMultiTestAreas();
            } else {
                const singleTextAreaContainer = document.querySelector('.text-area-container');
                if (singleTextAreaContainer) {
                    singleTextAreaContainer.style.display = 'block';
                }
            }

            // Populate text areas
            generatedScripts.forEach((script, index) => {
                const textarea = document.getElementById(`testArea${index}`);
                if (textarea) {
                    textarea.value = script.code;
                    updateTestAreaCharCount(index);
                    autoResizeTestTextarea(index);
                }
            });

            // For single test case, update main text area
            if (generatedScripts.length === 1 && elements.textArea) {
                elements.textArea.value = generatedScripts[0].code;
                updateCharCount();
                autoResizeTextarea();
                if (elements.codeActions) elements.codeActions.classList.add('show');
            }

            // Update button states - NEW WORKFLOW: Review before Execute
            const reviewBtn = document.getElementById('reviewBtn');
            const executeBtn = document.getElementById('executeBtn');
            const ingestBtn = document.getElementById('ingestBtn');

            generateBtn.disabled = true;
            generateBtn.classList.remove('btn-loading');
            generateBtn.textContent = 'Code Generated ✓';
            generateBtn.style.opacity = '0.6';
            generateBtn.style.cursor = 'not-allowed';

            // CHANGED: Enable review button instead of execute
            if (reviewBtn) {
                reviewBtn.disabled = false;
                reviewBtn.style.opacity = '1';
                reviewBtn.style.cursor = 'pointer';
            }

            // CHANGED: Keep execute button disabled until review is complete
            if (executeBtn) {
                executeBtn.disabled = true;
                executeBtn.style.opacity = '0.6';
                executeBtn.style.cursor = 'not-allowed';
            }

            if (ingestBtn) {
                ingestBtn.disabled = true;
                ingestBtn.style.opacity = '0.6';
            }

            showToast(`Generated ${generatedScripts.length} Python test scripts successfully! Review code before execution.`, 'success');
        } else {
            // Stop progress polling on failure
            stopProgressPolling();
            hideProgress();

            // Reset button on failure
            generateBtn.disabled = false;
            generateBtn.classList.remove('btn-loading');
            generateBtn.textContent = 'Generate Code';
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Generation error:', error);

        // Stop progress polling on error
        stopProgressPolling();
        hideProgress();

        // Reset button on error
        generateBtn.disabled = false;
        generateBtn.classList.remove('btn-loading');
        generateBtn.textContent = 'Generate Code';
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        showToast('Code generation failed: ' + error.message, 'error');
    }
}

// ================================================================================================
// MAIN FUNCTIONALITY - REVIEW CODE (WITH REAL PROGRESS)
// ================================================================================================

async function reviewCode() {
    console.log('🔍 Starting code review...');

    // CHANGED: Check for generated scripts instead of execution results
    if (generatedScripts.length === 0) {
        showToast('No generated scripts to review. Please generate Python code first!', 'warning');
        return;
    }

    const reviewBtn = document.getElementById('reviewBtn');
    if (!reviewBtn) return;

    reviewBtn.disabled = true;
    reviewBtn.classList.add('btn-loading');

    try {
        // Start real progress tracking
        startRealProgress('review', 'Reviewing Python Code Quality', [
            'Scanning Python code structure',
            'Analyzing syntax and PEP 8 compliance',
            'Checking Python best practices',
            'Running security analysis',
            'Generating Python recommendations',
            'Compiling final review report'
        ]);

        const response = await fetch('/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        const result = await response.json();
        console.log('📋 Review result:', result);

        if (result.success) {
            // NEW: HIDE BULK DOWNLOAD CONTROLS IMMEDIATELY WHEN REVIEW STARTS
            console.log('🗂️ Hiding bulk download controls - transitioning to review state');
            hideBulkDownloadControls();

            // Also remove the compact trigger button completely
            const compactButton = document.getElementById('compactBulkDownloadContainer');
            if (compactButton) {
                compactButton.remove();
                console.log('🗂️ Removed compact bulk download button');
            }

            // Remove the full bulk download controls container
            const bulkControls = document.getElementById('bulkDownloadControls');
            if (bulkControls) {
                bulkControls.remove();
                console.log('🗂️ Removed bulk download controls container');
            }

            // NEW: Handle individual reports for multiple test cases
            if (result.individual_reports && result.individual_reports.length > 0) {
                console.log('📋 Processing individual reports for multiple test cases');

                // Update each text area with its individual report
                result.individual_reports.forEach((report, index) => {
                    const textarea = document.getElementById(`testArea${index}`);
                    if (textarea) {
                        const individualReview = `=== CODE REVIEW REPORT ===
Test Case: ${report.test_case_name}
Script: ${report.script_name}

${report.review_report}

████████████████████████████████████████████████████████████████████████████████████████████████████████████████
██ ⚠️  IMPORTANT: CODE REVIEW COMPLETED SUCCESSFULLY. CHECK ERRORS/ISSUES BEFORE EXECUTION. ⚠️  ██
██ 🚀 CLICK "EXECUTE CODE" TO RUN THE REVIEWED TEST SCRIPTS IF THERE ARE NO STATIC CODE ANALYSIS ISSUE. 🚀 ██
████████████████████████████████████████████████████████████████████████████████████████████████████████████████`;

                        textarea.value = individualReview;
                        updateTestAreaCharCount(index);
                        autoResizeTestTextarea(index);
                    }
                });

                showToast(`Reviewed ${result.individual_reports.length} Python test scripts with individual analysis!`, 'success');
            }
            // Handle single test case or fallback to old behavior
            else {
                console.log('📋 Processing single test case or fallback review');

                // Update text areas with review reports (original behavior)
                generatedScripts.forEach((script, index) => {
                    const textarea = document.getElementById(`testArea${index}`);
                    if (textarea) {
                        const individualReview = `=== CODE REVIEW REPORT ===
Test Case: ${script.test_case_name}
Script: ${script.script_name}

${result.review_report || 'Review completed successfully.'}

=== INDIVIDUAL ANALYSIS ===
This review covers the specific test case: ${script.test_case_name}

████████████████████████████████████████████████████████████████████████████████████████████████████████████████
██ ⚠️  IMPORTANT: CODE REVIEW COMPLETED SUCCESSFULLY. CHECK ERRORS/ISSUES BEFORE EXECUTION. ⚠️  ██
██ 🚀 CLICK "EXECUTE CODE" TO RUN THE REVIEWED TEST SCRIPTS IF THERE ARE NO STATIC CODE ANALYSIS ISSUE. 🚀 ██
████████████████████████████████████████████████████████████████████████████████████████████████████████████████`;

                        textarea.value = individualReview;
                        updateTestAreaCharCount(index);
                        autoResizeTestTextarea(index);
                    }
                });

                showToast(`Reviewed ${generatedScripts.length} Python test scripts successfully!`, 'success');
            }

            // Single test case handling (when only one script)
            if (generatedScripts.length === 1 && elements.textArea) {
                const singleScript = generatedScripts[0];
                const singleReview = `=== CODE REVIEW REPORT ===
Test Case: ${singleScript.test_case_name}
Script: ${singleScript.script_name}

${result.review_report || result.main_summary || 'Review completed successfully.'}

=== ACTIONS REQUIRED ===
   ✅ 1. Look for [PASS] ✅ or [FAIL] ❌ indicators in the analysis above
   ✅ 2. CHECK "OPEN REPORT" FOR COMPREHENSIVE HTML RESULTS
   ✅ 3. CLICK THE **"EXECUTE CODE"** BUTTON IF NO CRITICAL ISSUES
   ❌ 4. DO NOT PROCEED IF STATIC CODE ANALYSIS FAILS OR SECURITY VULNERABILITIES ARE FOUND
   
████████████████████████████████████████████████████████████████████████████████████████████████████████████████
██ ⚠️  IMPORTANT: CODE REVIEW COMPLETED SUCCESSFULLY. CHECK ERRORS/ISSUES BEFORE EXECUTION. ⚠️  ██
██ 🚀 CLICK "EXECUTE CODE" TO RUN THE REVIEWED TEST SCRIPT IF THERE ARE NO STATIC CODE ANALYSIS ISSUE. 🚀 ██
████████████████████████████████████████████████████████████████████████████████████████████████████████████████`;

                elements.textArea.value = singleReview;
                updateCharCount();
                autoResizeTextarea();
            }

            // Update button states
            const generateBtn = document.getElementById('generateBtn');
            const executeBtn = document.getElementById('executeBtn');
            const ingestBtn = document.getElementById('ingestBtn');
            const reportButtons = document.getElementById('reportButtons');

            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }

            if (ingestBtn) {
                ingestBtn.disabled = true;
                ingestBtn.style.opacity = '0.6';
            }

            reviewBtn.disabled = true;
            reviewBtn.classList.remove('btn-loading');
            reviewBtn.textContent = 'Review Completed ✓';
            reviewBtn.style.opacity = '0.6';
            reviewBtn.style.cursor = 'not-allowed';

            // CHANGED: Enable execute button after successful review
            if (executeBtn) {
                executeBtn.disabled = false;
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            }

            if (reportButtons) reportButtons.classList.add('show');

            // NEW: Show execution checkboxes after review completion
            if (generatedScripts.length > 1) {
                showExecutionCheckboxes();
                console.log('✅ Execution checkboxes enabled after review completion');
            }

            // ADD THIS LINE: Hide save buttons after review completion
            hideSaveButtons();

        } else {
            // Stop progress polling on failure
            stopProgressPolling();
            hideProgress();

            // Reset button on failure
            reviewBtn.disabled = false;
            reviewBtn.classList.remove('btn-loading');
            reviewBtn.textContent = 'Review Code';
            reviewBtn.style.opacity = '1';
            reviewBtn.style.cursor = 'pointer';
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Review error:', error);

        // Stop progress polling on error
        stopProgressPolling();
        hideProgress();

        // Reset button on error
        reviewBtn.disabled = false;
        reviewBtn.classList.remove('btn-loading');
        reviewBtn.textContent = 'Review Code';
        reviewBtn.style.opacity = '1';
        reviewBtn.style.cursor = 'pointer';
        showToast('Code review failed: ' + error.message, 'error');
    }
}

// ================================================================================================
// MAIN FUNCTIONALITY - EXECUTE CODE (WITH REAL PROGRESS)
// ================================================================================================
/*
async function executeCode() {
    console.log('🚀 Execute Code button clicked');

    try {
        // Check if we have any scripts to execute
        if (!generatedScripts || generatedScripts.length === 0) {
            showToast('No test scripts available for execution. Please generate scripts first.', 'error');
            return;
        }

        // FIXED: Different logic for single vs multiple tests
        let selectedTestIds;

        if (generatedScripts.length === 1) {
            // For single test case: always execute without selection requirement
            console.log('📝 Single test case detected - executing without selection');
            selectedTestIds = [generatedScripts[0].id];
        } else {
            // For multiple test cases: require selection
            if (selectedTestCases.size === 0) {
                showToast('Please select at least one test case for execution.', 'warning');
                return;
            }
            selectedTestIds = Array.from(selectedTestCases);
            console.log('📝 Multiple test cases - executing selected:', selectedTestIds);
        }

        // Disable execute button during execution
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.classList.add('btn-loading');
        }

        // Start real progress tracking
        const selectedCount = selectedTestIds.length;
        const totalCount = generatedScripts.length;

        let progressTitle = `Executing ${selectedCount} Selected Python Test${selectedCount > 1 ? 's' : ''}`;
        if (selectedCount === totalCount) {
            progressTitle = 'Executing All Python Tests';
        }

        startRealProgress('execute', progressTitle, [
            'Preparing Python execution environment',
            'Connecting to test infrastructure',
            'Running selected Python test cases',
            'Collecting test results',
            'Generating execution output'
        ]);

        console.log(`🎯 Executing ${selectedTestIds.length} test case(s):`, selectedTestIds);

        // Make the API call with selected test IDs
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_test_ids: selectedTestIds
            })
        });

        const result = await response.json();
        console.log('🚀 Execution result:', result);

        if (result.success) {
            // ✅ SUCCESS PATH - FIXED RESULT MAPPING
            // Store execution results
            executionResults = result.execution_results;

            // FIXED: Map results by test case ID instead of array index
            executionResults.forEach((execResult) => {
                // Find the textarea index that corresponds to this test case ID
                const scriptIndex = generatedScripts.findIndex(script => script.id === execResult.test_case_id);

                if (scriptIndex !== -1) {
                    const textarea = document.getElementById(`testArea${scriptIndex}`);
                    if (textarea) {
                        const executionOutput = `=== EXECUTION RESULTS ===
Test Case: ${execResult.test_case_name}
Script: ${execResult.script_name}
Connected Host: ${result.connected_host}
Execution Status: ${execResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${execResult.stdout}

STDERR:
${execResult.stderr}

=== EXECUTION COMPLETED ===
✅Test: ${execResult.test_case_name} Execution Done`;

                        textarea.value = executionOutput;
                        updateTestAreaCharCount(scriptIndex);
                        autoResizeTestTextarea(scriptIndex);
                    }
                } else {
                    console.warn(`Could not find textarea for test case ID ${execResult.test_case_id}`);
                }
            });

            // FIXED: Single test case handling using test case ID mapping
            if (executionResults.length === 1 && elements.textArea) {
                const singleResult = executionResults[0];
                const singleExecution = `=== EXECUTION RESULTS ===
Test Case: ${singleResult.test_case_name}
Script: ${singleResult.script_name}
Connected Host: ${result.connected_host}
Execution Status: ${singleResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${singleResult.stdout}

STDERR:
${singleResult.stderr}

=== EXECUTION COMPLETED ===
✅ Test Case Execution Completed`;

                elements.textArea.value = singleExecution;
                updateCharCount();
                autoResizeTextarea();
            }

            // Final button states for SUCCESS
            const generateBtn = document.getElementById('generateBtn');
            const reviewBtn = document.getElementById('reviewBtn');

            executeBtn.disabled = true;
            executeBtn.classList.remove('btn-loading');
            executeBtn.textContent = `Executed ${selectedCount} Test${selectedCount > 1 ? 's' : ''} ✓`;
            executeBtn.style.opacity = '0.6';
            executeBtn.style.cursor = 'not-allowed';

            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }

            if (reviewBtn) {
                reviewBtn.disabled = true;
                reviewBtn.style.opacity = '0.6';
            }

            // Hide checkboxes after execution (only for multiple tests)
            if (generatedScripts.length > 1) {
                hideExecutionCheckboxes();
            }

            showToast(`Successfully executed ${selectedCount} test${selectedCount > 1 ? 's' : ''} out of ${totalCount} total!`, 'success');
            hideSaveButtons();

        } else {
            // Error handling - unchanged from your original
            console.error('❌ Execute failed:', result.message);
            stopProgressPolling();
            hideProgress();

            executeBtn.disabled = false;
            executeBtn.classList.remove('btn-loading');
            updateExecuteButtonState();

            if (result.message.includes('Raspberry Pi') ||
                result.message.includes('connection') ||
                result.message.includes('connect')) {
                showErrorModal(
                    'Test Execution Failed',
                    result.message,
                    'Unable to establish connection with the remote test infrastructure. Please verify that the Test devices are online and accessible from your network.'
                );
            } else {
                showToast(result.message, 'error');
            }
        }

    } catch (error) {
        // Error handling - unchanged from your original
        console.error('❌ Execution error:', error);
        stopProgressPolling();
        hideProgress();

        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        updateExecuteButtonState();

        if (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('connection') ||
            error.message.includes('Failed to fetch')) {
            showErrorModal(
                'Network Connection Error',
                'Failed to communicate with the test server.',
                `Technical Details: ${error.message}\n\nThis could be due to network connectivity issues or server unavailability.`
            );
        } else {
            showToast('Code execution failed: ' + error.message, 'error');
        }
    }
}
*/

// NEW FUNCTION: Parse execution output to determine actual test pass/fail status
function parseTestResult(executionOutput, scriptSuccess) {
    console.log('🔍 Parsing test result for pass/fail determination');

    const stdout = executionOutput.stdout || '';
    const stderr = executionOutput.stderr || '';
    const combinedOutput = (stdout + ' ' + stderr).toLowerCase();

    // If script didn't execute successfully at all, it's definitely a failure
    if (!scriptSuccess) {
        return {
            status: 'failed',
            reason: 'Script execution failed',
            color: '#ef4444',
            text: 'Failed ✗'
        };
    }

    // Define patterns that indicate test failure
    const failurePatterns = [
        /\[fail\]/i,
        /\[failed\]/i,
        /test.*fail/i,
        /fail.*test/i,
        /error:/i,
        /exception/i,
        /assertion.*fail/i,
        /test.*not.*pass/i,
        /does not match/i,
        /mismatch/i,
        /incorrect/i,
        /invalid/i,
        /test result:.*fail/i,
        /status:.*fail/i,
        /result:.*fail/i
    ];

    // Define patterns that indicate test success/pass
    const successPatterns = [
        /\[pass\]/i,
        /\[passed\]/i,
        /test.*pass/i,
        /pass.*test/i,
        /test.*success/i,
        /success.*test/i,
        /test result:.*completed/i,
        /test result:.*success/i,
        /test result:.*pass/i,
        /status:.*success/i,
        /status:.*pass/i,
        /result:.*success/i,
        /result:.*pass/i,
        /completed successfully/i,
        /test.*completed/i,
        /all.*tests.*pass/i
    ];

    // Check for explicit failure indicators first
    for (const pattern of failurePatterns) {
        if (pattern.test(combinedOutput)) {
            return {
                status: 'failed',
                reason: 'Test assertion failed',
                color: '#ef4444',
                text: 'Failed ✗'
            };
        }
    }

    // Check for explicit success indicators
    for (const pattern of successPatterns) {
        if (pattern.test(combinedOutput)) {
            return {
                status: 'passed',
                reason: 'Test completed successfully',
                color: '#22c55e',
                text: 'Passed ✓'
            };
        }
    }

    // Default: Script executed successfully but no clear pass/fail indicators
    return {
        status: 'executed',
        reason: 'Executed successfully (result unclear)',
        color: '#3b82f6',
        text: 'Executed ✓'
    };
}
// ================================================================================================
// ENHANCED EXECUTE CODE FUNCTION WITH STATUS INDICATORS
// ================================================================================================
/*
async function executeCode() {
    console.log('🚀 Execute Code button clicked');

    try {
        // Check if we have any scripts to execute
        if (!generatedScripts || generatedScripts.length === 0) {
            showToast('No test scripts available for execution. Please generate scripts first.', 'error');
            return;
        }

        // FIXED: Different logic for single vs multiple tests
        let selectedTestIds;

        if (generatedScripts.length === 1) {
            // For single test case: always execute without selection requirement
            console.log('📝 Single test case detected - executing without selection');
            selectedTestIds = [generatedScripts[0].id];
        } else {
            // For multiple test cases: require selection
            if (selectedTestCases.size === 0) {
                showToast('Please select at least one test case for execution.', 'warning');
                return;
            }
            selectedTestIds = Array.from(selectedTestCases);
            console.log('📝 Multiple test cases - executing selected:', selectedTestIds);
        }

        // Disable execute button during execution
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.classList.add('btn-loading');
        }

        // Start real progress tracking
        const selectedCount = selectedTestIds.length;
        const totalCount = generatedScripts.length;

        let progressTitle = `Executing ${selectedCount} Selected Python Test${selectedCount > 1 ? 's' : ''}`;
        if (selectedCount === totalCount) {
            progressTitle = 'Executing All Python Tests';
        }

        startRealProgress('execute', progressTitle, [
            'Preparing Python execution environment',
            'Connecting to test infrastructure',
            'Running selected Python test cases',
            'Collecting test results',
            'Generating execution output'
        ]);

        console.log(`🎯 Executing ${selectedTestIds.length} test case(s):`, selectedTestIds);

        // NEW: Add status indicators to headers BEFORE execution
        generatedScripts.forEach((script, index) => {
            const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
            if (testHeader) {
                // Remove any existing status indicators
                const existingStatus = testHeader.querySelector('.execution-status');
                if (existingStatus) {
                    existingStatus.remove();
                }

                // Add status indicator
                const statusDiv = document.createElement('div');
                statusDiv.className = 'execution-status';
                statusDiv.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: 60px;
                    transform: translateY(-50%);
                    background: ${selectedTestIds.includes(script.id) ? '#f59e0b' : '#6b7280'};
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    z-index: 10;
                `;
                statusDiv.textContent = selectedTestIds.includes(script.id) ? 'Executing...' : 'Not Selected';

                testHeader.appendChild(statusDiv);
            }
        });

        // Make the API call with selected test IDs
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_test_ids: selectedTestIds
            })
        });

        const result = await response.json();
        console.log('🚀 Execution result:', result);

        if (result.success) {
            // ✅ SUCCESS PATH - FIXED RESULT MAPPING
            // Store execution results
            executionResults = result.execution_results;

            // FIXED: Map results by test case ID instead of array index
            executionResults.forEach((execResult) => {
                // Find the textarea index that corresponds to this test case ID
                const scriptIndex = generatedScripts.findIndex(script => script.id === execResult.test_case_id);

                if (scriptIndex !== -1) {
                    const textarea = document.getElementById(`testArea${scriptIndex}`);
                    if (textarea) {
                        const executionOutput = `=== EXECUTION RESULTS ===
Test Case: ${execResult.test_case_name}
Script: ${execResult.script_name}
Connected Host: ${result.connected_host}
Execution Status: ${execResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${execResult.stdout}

STDERR:
${execResult.stderr}

=== EXECUTION COMPLETED ===
✅Test: ${execResult.test_case_name} Execution Done`;

                        textarea.value = executionOutput;
                        updateTestAreaCharCount(scriptIndex);
                        autoResizeTestTextarea(scriptIndex);
                    }

                    /*
                    // NEW: Update header status to show execution completed
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${scriptIndex + 2}) .test-area-header`);
                    if (testHeader) {
                        const statusDiv = testHeader.querySelector('.execution-status');
                        if (statusDiv) {
                            statusDiv.style.background = execResult.success ? '#22c55e' : '#ef4444';
                            statusDiv.textContent = execResult.success ? 'Executed ✓' : 'Failed ✗';
                        }
                    }*/
                    /*
                    // NEW: Update header status with smart pass/fail detection
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${scriptIndex + 2}) .test-area-header`);
                    if (testHeader) {
                        const statusDiv = testHeader.querySelector('.execution-status');
                        if (statusDiv) {
                            // Use smart parsing to determine actual test result
                            const smartResult = parseTestResult(execResult, execResult.success);
                            statusDiv.style.background = smartResult.color;
                            statusDiv.textContent = smartResult.text;
                            statusDiv.title = smartResult.reason; // Tooltip for details
                        }
                    }
                } else {
                    console.warn(`Could not find textarea for test case ID ${execResult.test_case_id}`);
                }
            });

            // NEW: Update headers for NON-EXECUTED test cases
            generatedScripts.forEach((script, index) => {
                if (!selectedTestIds.includes(script.id)) {
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
                    if (testHeader) {
                        const statusDiv = testHeader.querySelector('.execution-status');
                        if (statusDiv) {
                            statusDiv.style.background = '#6b7280';
                            statusDiv.textContent = 'Not Executed, showing Code Review Results';
                            statusDiv.style.fontSize = '1.0rem'; // Slightly smaller for longer text
                            statusDiv.style.padding = '4px 8px';
                        }
                    }
                }
            });

            // FIXED: Single test case handling using test case ID mapping
            if (executionResults.length === 1 && elements.textArea) {
                const singleResult = executionResults[0];
                const singleExecution = `=== EXECUTION RESULTS ===
Test Case: ${singleResult.test_case_name}
Script: ${singleResult.script_name}
Connected Host: ${result.connected_host}
Execution Status: ${singleResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${singleResult.stdout}

STDERR:
${singleResult.stderr}

=== EXECUTION COMPLETED ===
✅ Test Case Execution Completed`;

                elements.textArea.value = singleExecution;
                updateCharCount();
                autoResizeTextarea();
            }

            // Final button states for SUCCESS
            const generateBtn = document.getElementById('generateBtn');
            const reviewBtn = document.getElementById('reviewBtn');

            executeBtn.disabled = true;
            executeBtn.classList.remove('btn-loading');
            executeBtn.textContent = `Executed ${selectedCount} Test${selectedCount > 1 ? 's' : ''} ✓`;
            executeBtn.style.opacity = '0.6';
            executeBtn.style.cursor = 'not-allowed';

            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }

            if (reviewBtn) {
                reviewBtn.disabled = true;
                reviewBtn.style.opacity = '0.6';
            }

            // Hide checkboxes after execution (only for multiple tests)
            if (generatedScripts.length > 1) {
                hideExecutionCheckboxes();
            }

            showToast(`Successfully executed ${selectedCount} test${selectedCount > 1 ? 's' : ''} out of ${totalCount} total!`, 'success');
            hideSaveButtons();

        } else {
            // Error handling - reset status indicators on failure
            generatedScripts.forEach((script, index) => {
                const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
                if (testHeader) {
                    const statusDiv = testHeader.querySelector('.execution-status');
                    if (statusDiv) {
                        statusDiv.style.background = '#ef4444';
                        statusDiv.textContent = 'Execution Failed';
                    }
                }
            });

            console.error('❌ Execute failed:', result.message);
            stopProgressPolling();
            hideProgress();

            executeBtn.disabled = false;
            executeBtn.classList.remove('btn-loading');
            updateExecuteButtonState();

            if (result.message.includes('Raspberry Pi') ||
                result.message.includes('connection') ||
                result.message.includes('connect')) {
                showErrorModal(
                    'Test Execution Failed',
                    result.message,
                    'Unable to establish connection with the remote test infrastructure. Please verify that the Test devices are online and accessible from your network.'
                );
            } else {
                showToast(result.message, 'error');
            }
        }

    } catch (error) {
        // Error handling - reset status indicators on error
        generatedScripts.forEach((script, index) => {
            const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
            if (testHeader) {
                const statusDiv = testHeader.querySelector('.execution-status');
                if (statusDiv) {
                    statusDiv.style.background = '#ef4444';
                    statusDiv.textContent = 'Connection Error';
                }
            }
        });

        console.error('❌ Execution error:', error);
        stopProgressPolling();
        hideProgress();

        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        updateExecuteButtonState();

        if (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('connection') ||
            error.message.includes('Failed to fetch')) {
            showErrorModal(
                'Network Connection Error',
                'Failed to communicate with the test server.',
                `Technical Details: ${error.message}\n\nThis could be due to network connectivity issues or server unavailability.`
            );
        } else {
            showToast('Code execution failed: ' + error.message, 'error');
        }
    }
}
*/
// UPDATED: Main execute function with device selection
async function executeCode() {
    console.log('🚀 Execute Code button clicked');

    try {
        // Check if we have any scripts to execute
        if (!generatedScripts || generatedScripts.length === 0) {
            showToast('No test scripts available for execution. Please generate scripts first.', 'error');
            return;
        }

        // Load available devices first
        await loadAvailableDevices();

        if (availableDevices.length === 0) {
            showToast('No devices available for execution. Please check device configuration.', 'error');
            return;
        }

        // Show device selection modal
        createDeviceSelectionModal();

    } catch (error) {
        console.error('❌ Error in executeCode:', error);
        showToast('Failed to initialize execution: ' + error.message, 'error');
    }
}

// NEW: Actual execution function with selected device
async function executeCodeWithSelectedDevice() {
    console.log('🚀 Starting execution with selected device');

    try {
        // FIXED: Different logic for single vs multiple tests
        let selectedTestIds;

        if (generatedScripts.length === 1) {
            // For single test case: always execute without selection requirement
            console.log('📝 Single test case detected - executing without selection');
            selectedTestIds = [generatedScripts[0].id];
        } else {
            // For multiple test cases: require selection
            if (selectedTestCases.size === 0) {
                showToast('Please select at least one test case for execution.', 'warning');
                return;
            }
            selectedTestIds = Array.from(selectedTestCases);
            console.log('📝 Multiple test cases - executing selected:', selectedTestIds);
        }

        // Disable execute button during execution
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.classList.add('btn-loading');
        }

        // Start real progress tracking
        const selectedCount = selectedTestIds.length;
        const totalCount = generatedScripts.length;

        let progressTitle = `Executing ${selectedCount} Selected Python Test${selectedCount > 1 ? 's' : ''}`;
        if (selectedCount === totalCount) {
            progressTitle = 'Executing All Python Tests';
        }

        startRealProgress('execute', progressTitle, [
            'Preparing Python execution environment',
            'Connecting to selected test device',
            'Running selected Python test cases',
            'Collecting test results',
            'Generating execution output'
        ]);

        console.log(`🎯 Executing ${selectedTestIds.length} test case(s):`, selectedTestIds);

        // NEW: Add status indicators to headers BEFORE execution
        generatedScripts.forEach((script, index) => {
            const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
            if (testHeader) {
                // Remove any existing status indicators
                const existingStatus = testHeader.querySelector('.execution-status');
                if (existingStatus) {
                    existingStatus.remove();
                }

                // CREATE a new status div
                const statusDiv = document.createElement('div');
                statusDiv.className = 'execution-status';
                statusDiv.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: 60px;
                    transform: translateY(-50%);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    z-index: 10;
                `;

                // Set initial status based on selection
                if (selectedTestIds.includes(script.id)) {
                    statusDiv.style.background = '#f59e0b'; // Amber/yellow for executing
                    statusDiv.textContent = 'Executing...';
                    statusDiv.style.animation = 'pulse 2s infinite'; // Add pulsing animation
                } else {
                    statusDiv.style.background = '#6b7280'; // Gray for not selected
                    statusDiv.textContent = 'Not Selected';
                }

                testHeader.appendChild(statusDiv);
            }
        });

        // Make the API call with selected test IDs and device
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_test_ids: selectedTestIds,
                selected_device_id: selectedDeviceId  // NEW: Include selected device
            })
        });

        const result = await response.json();
        console.log('🚀 Execution result:', result);

        if (result.success) {
            // ✅ SUCCESS PATH - FIXED RESULT MAPPING
            // Store execution results
            executionResults = result.execution_results;

            // Show device information in toast
            if (result.connected_device) {
                showToast(`✅ Executed on ${result.connected_device.name} (${result.connected_device.host})`, 'success');
            }

            // FIXED: Map results by test case ID instead of array index
            executionResults.forEach((execResult) => {
                // Find the textarea index that corresponds to this test case ID
                const scriptIndex = generatedScripts.findIndex(script => script.id === execResult.test_case_id);

                if (scriptIndex !== -1) {
                    const textarea = document.getElementById(`testArea${scriptIndex}`);
                    if (textarea) {
                        const executionOutput = `=== EXECUTION RESULTS ===
Test Case: ${execResult.test_case_name}
Script: ${execResult.script_name}
Device: ${result.connected_device ? result.connected_device.name : 'Unknown'} (${result.connected_device ? result.connected_device.host : 'Unknown'})
Execution Status: ${execResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${execResult.stdout}

STDERR:
${execResult.stderr}

=== EXECUTION COMPLETED ===
✅Test: ${execResult.test_case_name} Execution Done`;

                        textarea.value = executionOutput;
                        updateTestAreaCharCount(scriptIndex);
                        autoResizeTestTextarea(scriptIndex);
                    }

                    // NEW: Update header status with smart pass/fail detection
                    /*
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${scriptIndex + 2}) .test-area-header`);
                    if (testHeader) {
                        const statusDiv = testHeader.querySelector('.execution-status');
                        if (statusDiv) {
                            // Use smart parsing to determine actual test result
                            const smartResult = parseTestResult(execResult, execResult.success);
                            statusDiv.style.background = smartResult.color;
                            statusDiv.textContent = smartResult.text;
                            statusDiv.title = smartResult.reason; // Tooltip for details
                        }
                    }*/
                    // NEW: Update header status with smart pass/fail detection
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${scriptIndex + 2}) .test-area-header`);
                    if (testHeader) {
                        let statusDiv = testHeader.querySelector('.execution-status');

                        // CREATE the status div if it doesn't exist
                        if (!statusDiv) {
                            statusDiv = document.createElement('div');
                            statusDiv.className = 'execution-status';
                            statusDiv.style.cssText = `
                                position: absolute;
                                top: 50%;
                                right: 60px;
                                transform: translateY(-50%);
                                color: white;
                                padding: 4px 12px;
                                border-radius: 15px;
                                font-size: 0.8rem;
                                font-weight: 600;
                                z-index: 10;
                            `;
                            testHeader.appendChild(statusDiv);
                        }

                        // Update with smart pass/fail detection
                        const smartResult = parseTestResult(execResult, execResult.success);
                        statusDiv.style.background = smartResult.color;
                        statusDiv.textContent = smartResult.text;
                        statusDiv.title = smartResult.reason; // Tooltip for details
                    }
                } else {
                    console.warn(`Could not find textarea for test case ID ${execResult.test_case_id}`);
                }
            });

            /*
            // NEW: Update headers for NON-EXECUTED test cases
            generatedScripts.forEach((script, index) => {
                if (!selectedTestIds.includes(script.id)) {
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
                    if (testHeader) {
                        const statusDiv = testHeader.querySelector('.execution-status');
                        if (statusDiv) {
                            statusDiv.style.background = '#6b7280';
                            statusDiv.textContent = 'Not Executed, showing Code Review Results';
                            statusDiv.style.fontSize = '1.0rem'; // Slightly smaller for longer text
                            statusDiv.style.padding = '4px 8px';
                        }
                    }
                }
            });
             */
            // NEW: Update headers for NON-EXECUTED test cases
            generatedScripts.forEach((script, index) => {
                if (!selectedTestIds.includes(script.id)) {
                    const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
                    if (testHeader) {
                        let statusDiv = testHeader.querySelector('.execution-status');

                        // CREATE the status div if it doesn't exist
                        if (!statusDiv) {
                            statusDiv = document.createElement('div');
                            statusDiv.className = 'execution-status';
                            statusDiv.style.cssText = `
                                position: absolute;
                                top: 50%;
                                right: 60px;
                                transform: translateY(-50%);
                                color: white;
                                padding: 4px 8px;
                                border-radius: 15px;
                                font-size: 0.8rem;
                                font-weight: 600;
                                z-index: 10;
                            `;
                            testHeader.appendChild(statusDiv);
                        }

                        // Update for non-executed status
                        statusDiv.style.background = '#6b7280';
                        statusDiv.textContent = 'Not Executed, showing Code Review Results';
                        statusDiv.style.fontSize = '1.0rem'; // Smaller for longer text
                        statusDiv.style.padding = '4px 8px';
                    }
                }
            });

            // FIXED: Single test case handling using test case ID mapping
            if (executionResults.length === 1 && elements.textArea) {
                const singleResult = executionResults[0];
                const singleExecution = `=== EXECUTION RESULTS ===
Test Case: ${singleResult.test_case_name}
Script: ${singleResult.script_name}
Device: ${result.connected_device ? result.connected_device.name : 'Unknown'} (${result.connected_device ? result.connected_device.host : 'Unknown'})
Execution Status: ${singleResult.success ? 'SUCCESS' : 'FAILED'}

=== EXECUTION OUTPUT ===
STDOUT:
${singleResult.stdout}

STDERR:
${singleResult.stderr}

=== EXECUTION COMPLETED ===
✅ Test Case Execution Completed`;

                elements.textArea.value = singleExecution;
                updateCharCount();
                autoResizeTextarea();
            }

            // Final button states for SUCCESS
            const generateBtn = document.getElementById('generateBtn');
            const reviewBtn = document.getElementById('reviewBtn');

            executeBtn.disabled = true;
            executeBtn.classList.remove('btn-loading');
            executeBtn.textContent = `Executed ${selectedCount} Test${selectedCount > 1 ? 's' : ''} ✓`;
            executeBtn.style.opacity = '0.6';
            executeBtn.style.cursor = 'not-allowed';

            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }

            if (reviewBtn) {
                reviewBtn.disabled = true;
                reviewBtn.style.opacity = '0.6';
            }

            // Hide checkboxes after execution (only for multiple tests)
            if (generatedScripts.length > 1) {
                hideExecutionCheckboxes();
            }

            showToast(`Successfully executed ${selectedCount} test${selectedCount > 1 ? 's' : ''} out of ${totalCount} total!`, 'success');
            hideSaveButtons();

        } else {
            // Error handling - reset status indicators on failure
            generatedScripts.forEach((script, index) => {
                const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
                if (testHeader) {
                    const statusDiv = testHeader.querySelector('.execution-status');
                    if (statusDiv) {
                        statusDiv.style.background = '#ef4444';
                        statusDiv.textContent = 'Execution Failed';
                    }
                }
            });

            console.error('❌ Execute failed:', result.message);
            stopProgressPolling();
            hideProgress();

            executeBtn.disabled = false;
            executeBtn.classList.remove('btn-loading');
            updateExecuteButtonState();

            if (result.message.includes('device') ||
                result.message.includes('connection') ||
                result.message.includes('connect')) {
                showErrorModal(
                    'Test Execution Failed',
                    result.message,
                    'Unable to establish connection with the selected test device. Please verify that the device is online and accessible from your network.'
                );
            } else {
                showToast(result.message, 'error');
            }
        }

    } catch (error) {
        // Error handling - reset status indicators on error
        generatedScripts.forEach((script, index) => {
            const testHeader = document.querySelector(`#multiTestAreas .test-area-group:nth-child(${index + 2}) .test-area-header`);
            if (testHeader) {
                const statusDiv = testHeader.querySelector('.execution-status');
                if (statusDiv) {
                    statusDiv.style.background = '#ef4444';
                    statusDiv.textContent = 'Connection Error';
                }
            }
        });

        console.error('❌ Execution error:', error);
        stopProgressPolling();
        hideProgress();

        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        updateExecuteButtonState();

        if (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('connection') ||
            error.message.includes('Failed to fetch')) {
            showErrorModal(
                'Network Connection Error',
                'Failed to communicate with the test server.',
                `Technical Details: ${error.message}\n\nThis could be due to network connectivity issues or server unavailability.`
            );
        } else {
            showToast('Code execution failed: ' + error.message, 'error');
        }
    }
}

// ================================================================================================
// INDIVIDUAL TEST CASE FUNCTIONS
// ================================================================================================

function saveTestCode(index) {
    console.log(`💾 Saving test code for index: ${index}`);

    const textarea = document.getElementById(`testArea${index}`);
    if (!textarea) return;

    const code = textarea.value.trim();
    if (!code) {
        showToast('No code to save!', 'warning');
        return;
    }

    const script = generatedScripts[index];

    fetch('/save_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
            test_case_id: script.id,
            test_case_name: script.test_case_name
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Test Case ${script.id} saved successfully!`, 'success');
        } else {
            showToast(`Save failed: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error saving code:', error);
        showToast('Error saving code', 'error');
    });
}

function downloadTestCode(index) {
    console.log(`📥 Downloading test code for index: ${index}`);

    const textarea = document.getElementById(`testArea${index}`);
    if (!textarea) return;

    const code = textarea.value.trim();
    if (!code) {
        showToast('No code to download!', 'warning');
        return;
    }
    //debug code - gourabm
    const codeMarker = '# Generated Python Test Code';
    const resultMarker = '=== EXECUTION RESULTS ===';
    const reviewMarker = "=== CODE REVIEW REPORT ==="

    let fileType = 'text/plain';
    let fileExtension = '.txt';
    let fileNamePrefix = "";
    let contentToDownload = code;

    if (code.includes(codeMarker)) {
        const codeStartIndex = code.indexOf(codeMarker);
        contentToDownload = code.substring(codeStartIndex);
        fileType = 'text/x-python';
        fileExtension = '.py';
        fileNamePrefix = 'generated-test-code';
    } else if (code.includes(resultMarker)) {
        fileNamePrefix = 'execution-results';
        const resultStartIndex = code.indexOf(resultMarker);
        contentToDownload = code.substring(resultStartIndex);
    } else if (code.includes(reviewMarker)) {
        fileNamePrefix = 'review-results';
        const resultStartIndex = code.indexOf(reviewMarker);
        contentToDownload = code.substring(resultStartIndex);
    } else {
        showToast('No recognizable content to download!', 'warning');
        return;
    }

    const script = generatedScripts[index];
    const element = document.createElement('a');
    const file = new Blob([contentToDownload], { type: fileType });
    element.href = URL.createObjectURL(file);
    element.download = `${fileNamePrefix}-${new Date().toISOString().slice(0,10)}${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`${fileNamePrefix} ${script.id} downloaded successfully!`, 'success');
}

// ================================================================================================
// ORIGINAL CODE ACTIONS (FALLBACK FOR SINGLE TEXTAREA)
// ================================================================================================

function saveCode() {
    console.log('💾 Saving code (single textarea mode)');

    if (!elements.textArea) return;

    const code = elements.textArea.value.trim();
    if (!code) {
        showToast('No code to save!', 'warning');
        return;
    }

    // Save to localStorage as backup
    localStorage.setItem('dashboard_code', code);
    localStorage.setItem('dashboard_code_timestamp', new Date().toISOString());

    fetch('/save_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`${data.message}`, 'success');
        } else {
            showToast(`Save failed: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error saving code:', error);
        showToast('Error saving code to file', 'error');
        showToast('Code saved to browser storage only', 'warning');
    });
}

function downloadCode() {
    console.log('📥 Downloading code (single textarea mode)');

    if (!elements.textArea) return;

    const fullText = elements.textArea.value.trim();

    if (!fullText) {
        showToast('No code to download!', 'warning');
        return;
    }

    const codeMarker = '# Generated Python Test Code';
    const resultMarker = '=== EXECUTION RESULTS ===';
    const reviewMarker = '=== CODE REVIEW REPORT ===';

    let fileType = 'text/plain';
    let fileExtension = '.txt';
    let fileNamePrefix = '';
    let contentToDownload = fullText;

    if (fullText.includes(codeMarker)) {
        const codeStartIndex = fullText.indexOf(codeMarker);
        contentToDownload = fullText.substring(codeStartIndex);
        fileType = 'text/x-python';
        fileExtension = '.py';
        fileNamePrefix = 'generated-test-code';
    } else if (fullText.includes(resultMarker)) {
        fileNamePrefix = 'execution-results';
        const resultStartIndex = fullText.indexOf(resultMarker);
        contentToDownload = fullText.substring(resultStartIndex);
    } else if (fullText.includes(reviewMarker)) {
        fileNamePrefix = 'review-results';
        const resultStartIndex = fullText.indexOf(reviewMarker);
        contentToDownload = fullText.substring(resultStartIndex);
    } else {
        showToast('No recognizable content to download!', 'warning');
        return;
    }

    const element = document.createElement('a');
    const file = new Blob([contentToDownload], { type: fileType });
    element.href = URL.createObjectURL(file);
    element.download = `${fileNamePrefix}-${new Date().toISOString().slice(0,10)}${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`${fileExtension} file downloaded successfully!`, 'success');
}

// ================================================================================================
// REPORT FUNCTIONS
// ================================================================================================

async function openReport() {
    console.log('📊 Opening report...');

    try {
        const response = await fetch('/open-report', { method: 'HEAD' });
        if (!response.ok) {
            showToast('Report not found on server.', 'error');
            return;
        }
        window.open('/open-report', '_blank');
        showToast('Report opened in new tab', 'success');
    } catch (err) {
        console.error('❌ Failed to open report:', err);
        showToast('Failed to open report.', 'error');
    }
}

async function downloadReport() {
    console.log('📥 Downloading report...');

    try {
        const response = await fetch('/download-report', { method: 'HEAD' });
        if (!response.ok) {
            showToast('Report not found on server.', 'error');
            return;
        }
        const link = document.createElement('a');
        link.href = '/download-report';
        link.download = 'combinedreport.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Report download started.', 'success');
    } catch (err) {
        console.error('❌ Failed to download report:', err);
        showToast('Failed to download report.', 'error');
    }
}

// ================================================================================================
// KEYBOARD SHORTCUTS AND ACCESSIBILITY
// ================================================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save code
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (generatedScripts.length > 0) {
            // Save all test codes
            generatedScripts.forEach((script, index) => {
                saveTestCode(index);
            });
        } else {
            saveCode();
        }
    }

    // Ctrl/Cmd + D to download code
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (generatedScripts.length > 0) {
            // Download all test codes
            generatedScripts.forEach((script, index) => {
                downloadTestCode(index);
            });
        } else {
            downloadCode();
        }
    }

    // Escape to close toast
    if (e.key === 'Escape') {
        hideToast();
    }
});

// ================================================================================================
// ERROR HANDLING AND LOGGING
// ================================================================================================

window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
    showToast('An unexpected error occurred. Please check the console for details.', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred. Please check the console for details.', 'error');
});

// ================================================================================================
// PERFORMANCE MONITORING
// ================================================================================================

function measurePerformance(functionName, fn) {
    return async function(...args) {
        const startTime = performance.now();
        try {
            const result = await fn.apply(this, args);
            const endTime = performance.now();
            console.log(`⚡ ${functionName} completed in ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const endTime = performance.now();
            console.error(`❌ ${functionName} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
            throw error;
        }
    };
}

// Wrap main functions with performance monitoring
const originalIngestTest = ingestTest;
const originalGenerateCode = generateCode;
const originalExecuteCode = executeCode;
const originalReviewCode = reviewCode;

ingestTest = measurePerformance('ingestTest', originalIngestTest);
generateCode = measurePerformance('generateCode', originalGenerateCode);
executeCode = measurePerformance('executeCode', originalExecuteCode);
reviewCode = measurePerformance('reviewCode', originalReviewCode);

// ================================================================================================
// GLOBAL FUNCTION EXPORTS FOR ONCLICK HANDLERS
// ================================================================================================

// Make sure all functions are globally available for onclick handlers
window.showHome = showHome;
window.showAutoTest = showAutoTest;
window.ingestTest = ingestTest;
window.generateCode = generateCode;
window.executeCode = executeCode;
window.reviewCode = reviewCode;
window.saveCode = saveCode;
window.downloadCode = downloadCode;
window.saveTestCode = saveTestCode;
window.downloadTestCode = downloadTestCode;
window.downloadReport = downloadReport;
window.openReport = openReport;
window.updateTestAreaCharCount = updateTestAreaCharCount;
window.autoResizeTestTextarea = autoResizeTestTextarea;
window.hideToast = hideToast;
// 6. ADD these functions to global exports at the end of the file
window.toggleTestSelection = toggleTestSelection;
window.selectAllTests = selectAllTests;
window.deselectAllTests = deselectAllTests;
window.showExecutionCheckboxes = showExecutionCheckboxes;
window.hideExecutionCheckboxes = hideExecutionCheckboxes;
// 10. Add these functions to global exports
window.toggleAllTests = toggleAllTests;
//window.selectRecommended = selectRecommended;
window.updateMasterCheckbox = updateMasterCheckbox;

window.toggleAllScriptsForDownload = toggleAllScriptsForDownload;
window.toggleScriptForDownload = toggleScriptForDownload;
window.downloadSelectedScripts = downloadSelectedScripts;
//window.showBulkDownloadControls = showBulkDownloadControls;
window.hideBulkDownloadControls = hideBulkDownloadControls;
window.createBulkDownloadControls = createBulkDownloadControls;
window.showBulkDownloadControlsCompact = showBulkDownloadControlsCompact;
window.createCompactBulkDownloadButton = createCompactBulkDownloadButton;
window.addBulkDownloadToMultiTestAreas = addBulkDownloadToMultiTestAreas;

// Make new functions globally available
window.loadAvailableDevices = loadAvailableDevices;
window.checkDeviceStatus = checkDeviceStatus;
window.createDeviceSelectionModal = createDeviceSelectionModal;
window.selectDevice = selectDevice;
window.checkSingleDeviceStatus = checkSingleDeviceStatus;
window.refreshDeviceStatus = refreshDeviceStatus;
window.confirmDeviceSelection = confirmDeviceSelection;
window.closeDeviceSelectionModal = closeDeviceSelectionModal;
window.executeCodeWithSelectedDevice = executeCodeWithSelectedDevice;

// Developer mode functions
window.showDeveloperMode = showDeveloperMode;
window.showQAMode = showQAMode;
window.showCodebaseManager = showCodebaseManager;
window.ingestDeveloperRequirements = ingestDeveloperRequirements;
window.generateApplicationCode = generateApplicationCode;
window.toggleStorySelection = toggleStorySelection;
window.updateCodebaseStatus = updateCodebaseStatus;
window.updateCodeAreaCharCount = updateCodeAreaCharCount;
window.autoResizeCodeTextarea = autoResizeCodeTextarea;
window.displayGeneratedCode = displayGeneratedCode;
window.saveApplicationCode = saveApplicationCode;
window.downloadApplicationCode = downloadApplicationCode;
window.delay = delay;

// Codebase Manager functions
window.uploadCodebase = uploadCodebase;
window.clearCodebase = clearCodebase;
window.searchCodebase = searchCodebase;
window.displaySearchResults = displaySearchResults;

window.resetDeveloperElements = resetDeveloperElements;
window.resetQAElements = resetQAElements;
window.displayCodebaseDetails = displayCodebaseDetails;

window.switchCodebase = switchCodebase;
window.toggleSection = toggleSection;
window.resyncCurrentCodebase = resyncCurrentCodebase;
window.clearCurrentCodebase = clearCurrentCodebase;
window.saveCodebaseToStorage = saveCodebaseToStorage;
window.displayCodebaseInSidebar = displayCodebaseInSidebar;
// ================================================================================================
// INITIALIZATION COMPLETE
// ================================================================================================

console.log('🎉 Cognizant AutoTest Dashboard - Complete JavaScript with Real Progress Loaded Successfully!');
console.log('📱 Multi-test case support enabled');
console.log('🔧 All functions exported globally');
console.log('⚡ Performance monitoring active');
console.log('♿ Accessibility features enabled');
console.log('🛡️ Error handling configured');
console.log('📊 Real progress tracking implemented');
console.log('🔄 New workflow: Upload → Ingest → Generate → Review → Execute');

// ================================================================================================
// DEVELOPMENT HELPERS (Remove in production)
// ================================================================================================

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development mode helpers
    console.log('🔧 Development mode detected');

    // Add debug info to window object for console access
    window.debugInfo = {
        uploadedFiles,
        ingestedTestCases,
        generatedScripts,
        executionResults,
        elements,
        progressPollingInterval,
        currentTaskType
    };

    // Log performance metrics
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const navTiming = performance.getEntriesByType('navigation')[0];
                console.log(`📊 Page load time: ${navTiming.loadEventEnd - navTiming.fetchStart}ms`);
            }, 0);
        });
    }
}

// ================================================================================================
// END OF FILE
// ================================================================================================