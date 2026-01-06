import { Metadata } from '../language/generated/ast'

export class TemplateGenerator {
    private title: string = 'SlideDeckML Presentation'
    private author: string = 'Unknown Author'
    private css: string = ''
    private logo: string = ''
    private theme: string = 'white'

    public setMetadata(metadata: Metadata): void {
        // Access author and title directly from the metadata object
        this.author = metadata.author.replace(/^"|"$/g, '')
        this.title = metadata.title.replace(/^"|"$/g, '')
        if (metadata.css) {
            this.css = metadata.css.replace(/^"|"$/g, '')
        }
        if (metadata.logo) {
            this.logo = metadata.logo.replace(/^"|"$/g, '')
        }
        if (metadata.theme) {
            this.theme = metadata.theme.replace(/^"|"$/g, '')
        }
    }
    public getHTMLTemplate(slidesContent: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="${this.author}">
    <meta name="title" content="${this.title}">
    <title>${this.title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/${
        this.theme
    }.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/plugin/highlight/monokai.css">
    <style> 
        ${this.css}
        /* Synchronized fragments styling */
        .sync-container {
            position: relative;
            min-height: 50px;
            font-size: 0.9em;
        }
        .sync-item {
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        .sync-item.active {
            display: block;
            opacity: 1;
        }
        .sync-item p {
            margin: 0.3em 0;
        }
        .sync-item img {
            max-width: 100%;
            height: auto;
        }
        /* Keep mode: stack items vertically */
        .sync-container[data-keep="true"] {
            display: flex;
            flex-direction: column;
            gap: 0.3em;
        }
        .sync-container[data-keep="true"] .sync-item {
            position: relative;
        }
    </style>
</head>
<body>
    ${
        this.css
            ? `<header class="header-banner">
        <div class="header-author">${this.author}</div>
        ${
            this.logo
                ? `<img src="${this.logo}" alt="Logo" class="header-logo">`
                : ''
        }
    </header>`
            : ''
    }
    <div class="reveal">
        <div class="slides">
${slidesContent}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/plugin/highlight/highlight.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: 'slide',
            backgroundTransition: 'fade',
            plugins: [ RevealHighlight ]
        });

        // Synchronized fragments handler
        let currentFragmentIndex = -1;

        Reveal.on('fragmentshown', event => {
            currentFragmentIndex++;
            updateSyncItems();
        });

        Reveal.on('fragmenthidden', event => {
            currentFragmentIndex--;
            updateSyncItems();
        });

        Reveal.on('slidechanged', event => {
            // Detect the current fragment state by checking visible fragments
            const currentSlide = Reveal.getCurrentSlide();
            if (currentSlide) {
                const fragments = currentSlide.querySelectorAll('.fragment');
                let maxVisibleIndex = -1;
                
                fragments.forEach(fragment => {
                    if (fragment.classList.contains('visible')) {
                        const fragmentIndex = parseInt(fragment.getAttribute('data-fragment-index') || '0');
                        maxVisibleIndex = Math.max(maxVisibleIndex, fragmentIndex);
                    }
                });
                
                currentFragmentIndex = maxVisibleIndex;
            } else {
                currentFragmentIndex = -1;
            }
            updateSyncItems();
        });

        function updateSyncItems() {
            const currentSlide = Reveal.getCurrentSlide();
            if (!currentSlide) return;

            const syncContainers = currentSlide.querySelectorAll('.sync-container');
            syncContainers.forEach(container => {
                const keepMode = container.getAttribute('data-keep') === 'true';
                const items = container.querySelectorAll('.sync-item');
                
                items.forEach(item => {
                    const syncIndex = parseInt(item.getAttribute('data-sync-index') || '0');
                    
                    if (keepMode) {
                        // In keep mode, show all items up to and including current index
                        if (syncIndex <= currentFragmentIndex) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    } else {
                        // Default mode: show only the current item
                        if (syncIndex === currentFragmentIndex) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    }
                });
            });
        }

        // Initialize on load
        Reveal.on('ready', () => {
            updateSyncItems();
        });
    </script>
</body>
</html>`
    }
}
