// SlideDeckML Live Preview Application

// Configuration
const COMPILE_DEBOUNCE_MS = 1000;  // Délai avant compilation après modification
const CURSOR_DEBOUNCE_MS = 500;    // Délai avant compilation après mouvement du curseur
const DEBUG_MEMORY = true;         // Activer les logs de debug mémoire

class SlideDeckMLApp {
    constructor() {
        this.editor = null;
        this.socket = null;
        this.previewIframe = document.getElementById('preview-iframe');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.slideCount = document.getElementById('slide-count');
        this.errorBanner = document.getElementById('error-banner');
        this.errorDetails = document.getElementById('error-details');
        this.errorToggle = document.getElementById('error-toggle');
        this.compileTimeout = null;
        this.currentSlideIndex = 0;
        this.totalSlides = 0;
        this.hasTemplate = false;
        this.isInitialized = false;
        this.currentFilePath = null;
        this.isSaving = false;
        this.revealInitialized = false;
        this.compilationCount = 0;

        this.init();

        // Monitor memory if enabled
        if (DEBUG_MEMORY) {
            this.startMemoryMonitoring();
        }
    }

    async init() {
        await this.initMonaco();
        this.initWebSocket();
        this.initResizer();
        this.initKeyboardShortcuts();
        this.initErrorToggle();
        await this.loadInitialContent();
    }

    initErrorToggle() {
        this.errorToggle.addEventListener('click', () => {
            const isVisible = this.errorDetails.style.display === 'block';
            this.errorDetails.style.display = isVisible ? 'none' : 'block';
            this.errorToggle.textContent = isVisible ? '▼ Show Details' : '▲ Hide Details';
        });
    }

    async initMonaco() {
        return new Promise((resolve) => {
            require.config({
                paths: {
                    'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs'
                }
            });

            require(['vs/editor/editor.main'], () => {
                // Define SlideDeckML language
                monaco.languages.register({ id: 'slidedeckml' });

                // Set language syntax highlighting
                monaco.languages.setMonarchTokensProvider('slidedeckml', {
                    tokenizer: {
                        root: [
                            [/^===\s*$/, 'delimiter.slide'],
                            [/^---\s*$/, 'delimiter.template'],
                            [/^#{1,3}\s+.*$/, 'keyword.heading'],
                            [/^\s*[-*+]\s+/, 'keyword.list'],
                            [/^\s*\d+\.\s+/, 'keyword.list'],
                            [/^>\s+.*$/, 'comment.quote'],
                            [/!\[.*?\]\(.*?\)/, 'string.media'],
                            [/\*\*.*?\*\*/, 'strong'],
                            [/\*.*?\*/, 'emphasis'],
                            [/__.*?__/, 'string.underline'],
                            [/```[\s\S]*?```/, 'string.code'],
                            [/:::/, 'delimiter.style'],
                            [/\{[^}]*\}/, 'attribute'],
                        ]
                    }
                });

                // Define theme
                monaco.editor.defineTheme('slidedeckml-theme', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'delimiter.slide', foreground: 'ff6b6b', fontStyle: 'bold' },
                        { token: 'delimiter.template', foreground: '4ecdc4', fontStyle: 'bold' },
                        { token: 'keyword.heading', foreground: '95e1d3', fontStyle: 'bold' },
                        { token: 'keyword.list', foreground: 'ffe66d' },
                        { token: 'comment.quote', foreground: '6c757d', fontStyle: 'italic' },
                        { token: 'string.media', foreground: '9d4edd' },
                        { token: 'strong', foreground: 'ff9f1c', fontStyle: 'bold' },
                        { token: 'emphasis', foreground: '80ed99', fontStyle: 'italic' },
                        { token: 'string.underline', foreground: '57cc99', fontStyle: 'underline' },
                        { token: 'string.code', foreground: 'd4a5a5' },
                        { token: 'delimiter.style', foreground: 'c77dff' },
                        { token: 'attribute', foreground: 'ffd60a' },
                    ],
                    colors: {}
                });

                // Create editor
                this.editor = monaco.editor.create(document.getElementById('editor-container'), {
                    value: '# Loading...',
                    language: 'slidedeckml',
                    theme: 'slidedeckml-theme',
                    fontSize: 14,
                    lineNumbers: 'on',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on'
                });

                // Listen to content changes
                this.editor.onDidChangeModelContent(() => {
                    this.onEditorChange();
                });

                // Listen to cursor position changes
                this.editor.onDidChangeCursorPosition(() => {
                    this.onCursorChange();
                });

                resolve();
            });
        });
    }

    initWebSocket() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateStatus('ready', 'Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateStatus('error', 'Disconnected');
        });

        this.socket.on('compilation-result', (result) => {
            this.handleCompilationResult(result);
        });

        this.socket.on('compilation-error', (data) => {
            this.handleCompilationError(data.error);
        });
    }

    initResizer() {
        const resizer = document.querySelector('.resizer');
        const editorPanel = document.querySelector('.editor-panel');
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerWidth = document.querySelector('.container').offsetWidth;
            const newWidth = (e.clientX / containerWidth) * 100;

            if (newWidth > 20 && newWidth < 80) {
                editorPanel.style.flex = `0 0 ${newWidth}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    async loadInitialContent() {
        try {
            const response = await fetch('/api/initial-content');
            const data = await response.json();
            this.editor.setValue(data.content);
            this.currentFilePath = data.filePath;

            // Update title if we have a file path
            if (this.currentFilePath) {
                const fileName = this.currentFilePath.split('/').pop();
                document.title = `${fileName} - SlideDeckML`;
            }

            // Trigger initial compilation
            this.compile();
        } catch (error) {
            console.error('Failed to load initial content:', error);
            this.updateStatus('error', 'Failed to load');
        }
    }

    initKeyboardShortcuts() {
        // Capture Ctrl+S / Cmd+S for saving
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveFile();
            }
        });
    }

    async saveFile() {
        if (this.isSaving) return;

        if (!this.currentFilePath) {
            this.showNotification('No file path available. Start with: npm run dev <file>', 'error');
            return;
        }

        this.isSaving = true;
        this.updateStatus('compiling', 'Saving...');

        try {
            const content = this.editor.getValue();

            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    filePath: this.currentFilePath
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification(result.message, 'success');
                this.updateStatus('ready', 'Saved');

                // Reset status back to "Ready" after 2 seconds
                setTimeout(() => {
                    this.updateStatus('ready', 'Ready');
                }, 2000);
            } else {
                this.showNotification('Save failed: ' + result.error, 'error');
                this.updateStatus('error', 'Save failed');
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification('Save failed: ' + error.message, 'error');
            this.updateStatus('error', 'Save failed');
        } finally {
            this.isSaving = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    onEditorChange() {
        // Debounce compilation
        clearTimeout(this.compileTimeout);
        this.updateStatus('compiling', 'Compiling...');

        this.compileTimeout = setTimeout(() => {
            this.compile();
        }, COMPILE_DEBOUNCE_MS);
    }

    onCursorChange() {
        // When cursor moves, we might want to compile to update the slide view
        // But only if we're not already compiling
        if (!this.compileTimeout) {
            clearTimeout(this.compileTimeout);
            this.compileTimeout = setTimeout(() => {
                this.compile();
            }, CURSOR_DEBOUNCE_MS);
        }
    }

    compile() {
        const content = this.editor.getValue();
        const position = this.editor.getPosition();
        const cursorLine = position ? position.lineNumber - 1 : 0; // Convert to 0-based

        this.socket.emit('compile', { content, cursorLine });
    }

    handleCompilationResult(result) {
        if (result.error) {
            this.handleCompilationError(result.error);
            return;
        }

        // Hide error banner
        this.errorBanner.style.display = 'none';

        // Update slide count
        this.totalSlides = result.slideCount;
        this.hasTemplate = result.hasTemplate || false;
        this.currentSlideIndex = result.slideIndex !== undefined ? result.slideIndex : 0;

        // Calculate reveal.js slide index (add 1 if there's a template)
        const revealSlideIndex = this.hasTemplate ? this.currentSlideIndex + 1 : this.currentSlideIndex;

        // Update preview (will update slide count after navigation)
        this.updatePreview(result.html, revealSlideIndex);

        // Update status
        this.updateStatus('ready', 'Ready');

        // Mark as initialized after first successful compilation
        if (!this.isInitialized) {
            this.isInitialized = true;
        }
    }

    handleCompilationError(error) {
        this.updateStatus('error', 'Error');

        // Show error banner at top
        this.errorDetails.textContent = error + '\n\n💡 Tip: Fix the errors and the preview will update automatically.';
        this.errorBanner.style.display = 'block';

        // Keep the details collapsed by default
        this.errorDetails.style.display = 'none';
        this.errorToggle.textContent = '▼ Show Details';
    }

    updatePreview(html, slideIndex) {
        this.compilationCount++;

        if (DEBUG_MEMORY) {
            console.log(`[Preview Update #${this.compilationCount}] Navigating to slide ${slideIndex}`);
        }

        // Strategy: Replace the entire iframe to ensure clean slate
        // This is more aggressive but prevents memory leaks
        const oldIframe = this.previewIframe;
        const newIframe = document.createElement('iframe');

        // Copy attributes
        newIframe.id = 'preview-iframe';
        newIframe.sandbox = 'allow-scripts allow-same-origin allow-popups';

        // Replace the iframe
        oldIframe.parentNode.replaceChild(newIframe, oldIframe);
        this.previewIframe = newIframe;

        if (DEBUG_MEMORY) {
            console.log('[Preview] Iframe replaced, writing HTML...');
        }

        // Write content to new iframe
        const iframeDoc = newIframe.contentDocument || newIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for Reveal.js to initialize with retry mechanism
        this.waitForRevealAndNavigate(slideIndex, 0);

        // Force garbage collection hint (not guaranteed but helps)
        if (window.gc) {
            setTimeout(() => window.gc(), 500);
        }
    }

    waitForRevealAndNavigate(slideIndex, retryCount = 0) {
        const maxRetries = 10;
        const retryDelay = 100;

        setTimeout(() => {
            const iframeWindow = this.previewIframe.contentWindow;

            if (iframeWindow && iframeWindow.Reveal) {
                this.revealInitialized = true;

                // Navigate to the specific slide
                iframeWindow.Reveal.slide(slideIndex, 0);

                // Get the actual current slide after navigation
                const indices = iframeWindow.Reveal.getIndices();

                // Update the counter (subtract 1 if there's a template to get back to 0-based slide index)
                const actualSlideIndex = this.hasTemplate ? indices.h - 1 : indices.h;
                this.currentSlideIndex = Math.max(0, actualSlideIndex);
                this.updateSlideCount();

                // Listen to slide changes in the preview (user navigation)
                iframeWindow.Reveal.on('slidechanged', (event) => {
                    // Adjust for template
                    const userSlideIndex = this.hasTemplate ? event.indexh - 1 : event.indexh;
                    this.currentSlideIndex = Math.max(0, userSlideIndex);
                    this.updateSlideCount();
                });

                if (DEBUG_MEMORY) {
                    console.log(`[Preview] Reveal.js initialized after ${retryCount} retries, navigated to slide ${slideIndex}`);
                }
            } else if (retryCount < maxRetries) {
                // Retry
                if (DEBUG_MEMORY && retryCount === 0) {
                    console.log('[Preview] Reveal.js not ready, retrying...');
                }
                this.waitForRevealAndNavigate(slideIndex, retryCount + 1);
            } else {
                console.warn('[Preview] Reveal.js failed to initialize after max retries');
            }
        }, retryDelay);
    }

    updateSlideCount() {
        this.slideCount.textContent = `Slide ${this.currentSlideIndex + 1} / ${this.totalSlides}`;
    }

    updateStatus(type, text) {
        this.statusIndicator.className = `status-dot ${type}`;
        this.statusText.textContent = text;
    }

    startMemoryMonitoring() {
        // Log memory usage every 5 seconds
        setInterval(() => {
            if (performance.memory) {
                const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
                const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
                const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
                console.log(`[Memory] Used: ${used} MB / Total: ${total} MB / Limit: ${limit} MB | Compilations: ${this.compilationCount}`);
            }
        }, 5000);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SlideDeckMLApp();
    });
} else {
    new SlideDeckMLApp();
}
