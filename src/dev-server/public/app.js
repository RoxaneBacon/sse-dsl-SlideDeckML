// SlideDeckML Live Preview Application

class SlideDeckMLApp {
    constructor() {
        this.editor = null;
        this.socket = null;
        this.previewIframe = document.getElementById('preview-iframe');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.slideCount = document.getElementById('slide-count');
        this.errorDisplay = document.getElementById('error-display');
        this.compileTimeout = null;
        this.currentSlideIndex = 0;
        this.totalSlides = 0;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        await this.initMonaco();
        this.initWebSocket();
        this.initResizer();
        await this.loadInitialContent();
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

            // Trigger initial compilation
            this.compile();
        } catch (error) {
            console.error('Failed to load initial content:', error);
            this.updateStatus('error', 'Failed to load');
        }
    }

    onEditorChange() {
        // Debounce compilation
        clearTimeout(this.compileTimeout);
        this.updateStatus('compiling', 'Compiling...');

        this.compileTimeout = setTimeout(() => {
            this.compile();
        }, 500);
    }

    onCursorChange() {
        // When cursor moves, we might want to compile to update the slide view
        // But only if we're not already compiling
        if (!this.compileTimeout) {
            clearTimeout(this.compileTimeout);
            this.compileTimeout = setTimeout(() => {
                this.compile();
            }, 300);
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

        // Hide error display
        this.errorDisplay.style.display = 'none';

        // Update preview
        this.updatePreview(result.html, result.slideIndex || 0);

        // Update slide count
        this.totalSlides = result.slideCount;
        this.currentSlideIndex = result.slideIndex || 0;
        this.updateSlideCount();

        // Update status
        this.updateStatus('ready', 'Ready');

        // Mark as initialized after first successful compilation
        if (!this.isInitialized) {
            this.isInitialized = true;
        }
    }

    handleCompilationError(error) {
        this.updateStatus('error', 'Error');
        this.errorDisplay.textContent = error;
        this.errorDisplay.style.display = 'block';
    }

    updatePreview(html, slideIndex) {
        // Update iframe content
        const iframeDoc = this.previewIframe.contentDocument || this.previewIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for Reveal.js to initialize, then navigate to the slide
        setTimeout(() => {
            const iframeWindow = this.previewIframe.contentWindow;
            if (iframeWindow && iframeWindow.Reveal) {
                // Navigate to the specific slide
                iframeWindow.Reveal.slide(slideIndex, 0);

                // Listen to slide changes in the preview
                iframeWindow.Reveal.on('slidechanged', (event) => {
                    this.currentSlideIndex = event.indexh;
                    this.updateSlideCount();
                });
            }
        }, 100);
    }

    updateSlideCount() {
        this.slideCount.textContent = `Slide ${this.currentSlideIndex + 1} / ${this.totalSlides}`;
    }

    updateStatus(type, text) {
        this.statusIndicator.className = `status-dot ${type}`;
        this.statusText.textContent = text;
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
