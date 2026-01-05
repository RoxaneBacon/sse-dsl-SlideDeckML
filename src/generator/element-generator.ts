
/**
 * This module is responsible for generating HTML elements from the AST nodes.
 * So Each lines is a specific element (heading, paragraph, list, etc.)
 * And for each text inside an element we use the TextProcessor to handle inline formatting. (bold, italic, underline) 
 */
export class ElementGenerator {
    textProcessor = new TextProcessor();

    /**
     * Generate a heading element
     * @param heading The heading AST node
     * @returns The HTML string for the heading
     */
    public generateHeading(heading: any, style: string = ''): string {
        // Access level and text directly from the AST
        const level = heading.level.length;
        const text = heading.text;
        
        return `            <h${level}${style}>${this.textProcessor.processInlineText(text)}</h${level}>`;
    }

    /**
     * Generate a paragraph element
     * @param paragraph The paragraph AST node
     * @returns The HTML string for the paragraph
     */
    public generateParagraph(paragraph: any, style: string = ''): string {
        return `            <p${style}>${this.textProcessor.processInlineText(paragraph.text)}</p>`;
    }

    /**
     * Generate a pointed list element
     * @param list The pointed list AST node
     * @returns The HTML string for the pointed list
     */
    public generatePointedList(list: any, style: string = ''): string {
        const items = list.items
            .map((item: any) => {
                // Access text directly from the AST
                const text = item.text;
                return `                <li>${this.textProcessor.processInlineText(text)}</li>`;
            })
            .join('\n');
        return `            <ul${style}>\n${items}\n            </ul>`;
    }

    /**
     * Generate an ordered list element
     * @param list The ordered list AST node
     * @returns The HTML string for the ordered list
     */
    public generateOrderedList(list: any, style: string = ''): string {
        const items = list.items
            .map((item: any) => {
                // Access text directly from the AST
                const text = item.text;
                return `                <li>${this.textProcessor.processInlineText(text)}</li>`;
            })
            .join('\n');
        return `            <ol${style}>\n${items}\n            </ol>`;
    }

    /**
     * Generate a quote element
     * @param quote The quote AST node
     * @returns The HTML string for the quote
     */
    public generateQuote(quote: any, style: string = ''): string {
        const text = quote.text;
        return `            <blockquote${style}>${this.textProcessor.processInlineText(text)}</blockquote>`;
    }

    /**
     * Generate a media element (image or video)
     * @param media The media AST node
     * @returns The HTML string for the media
     */
    public generateMedia(media: any, style: string = ''): string {
        const content = media.content;
        
        // Parse the media line: ![alt](url)
        const match = content.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
        if (!match) return '';
        
        const alt = match[1];
        const url = match[2];
        
        // Determine if it's a video based on file extension
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const isVideo = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
        
        if (isVideo) {
            return `            <video controls${style}>\n                <source src="${url}" type="video/${this.getVideoType(url)}">\n                ${alt}\n            </video>`;
        } else {
            return `            <img src="${url}" alt="${alt}"${style}>`;
        }
    }

        /**
     * Generate a code block element
     * @param codeBlock The code block AST node
     * @returns The HTML string for the code block
     */
    public generateCodeBlock(codeBlock: any, style: string = ''): string {
        const content = codeBlock.content;
        
        // Parse the code block: ```language [attributes] code ```
        const match = content.match(/```([a-zA-Z0-9_\-]*)?(?:\s*\[([^\]]*)\])?\s*[\r\n]([\s\S]*?)```/);
        if (!match) return '';
        
        const language = match[1] || '';
        const attributesStr = match[2] || '';
        const code = match[3] || '';

        // Build the class attribute
        const languageClass = language ? ` class="language-${language}"` : '';

        // Build data attributes for line numbers
        let dataAttrs = ' data-trim data-noescape';
        
        if (attributesStr) {
            // Parse attributes - handle both new abstract syntax and reveal.js syntax
            const attributes = this.parseCodeAttributes(attributesStr);
            
            // Handle abstract highlight modes
            if (attributes.highlight) {
                const highlightPattern = this.convertHighlightMode(attributes.highlight, code);
                if (highlightPattern) {
                    dataAttrs += ` data-line-numbers="${highlightPattern}"`;
                }
            }
            
            // Handle explicit line numbers (reveal.js style)
            if (attributes.lines) {
                dataAttrs += ` data-line-numbers="${attributes.lines}"`;
            }
            
            // Handle start offset
            if (attributes.start) {
                dataAttrs += ` data-ln-start-from="${attributes.start}"`;
            }
        }

        // Escape HTML in code content
        const escapedCode = this.textProcessor.escapeHtml(code);

        return `            <pre${style}><code${languageClass}${dataAttrs}>${escapedCode}</code></pre>`;
    }

    /**
     * Parse code block attributes from string
     * Supports both: highlight:block lines:'1-5' start:10
     * @param attributesStr The attributes string from the code block
     * @returns Parsed attributes object
     */
    private parseCodeAttributes(attributesStr: string): any {
        const attrs: any = {};
        
        // Match highlight mode: highlight:mode
        const highlightMatch = attributesStr.match(/highlight\s*:\s*([a-z\-]+)/);
        if (highlightMatch) {
            attrs.highlight = highlightMatch[1];
        }
        
        // Match lines: lines:'...' or lines:"..."
        const linesMatch = attributesStr.match(/lines\s*:\s*["']([^"']+)["']/);
        if (linesMatch) {
            attrs.lines = linesMatch[1];
        }
        
        // Match start: start:number
        const startMatch = attributesStr.match(/start\s*:\s*(\d+)/);
        if (startMatch) {
            attrs.start = startMatch[1];
        }
        
        return attrs;
    }

    /**
     * Convert abstract highlight mode to reveal.js line numbers pattern
     * @param mode The highlight mode keyword
     * @param code The code content
     * @returns The reveal.js line numbers pattern
     */
    private convertHighlightMode(mode: string, code: string): string {
        const lines = code.trim().split('\n');
        const totalLines = lines.length;

        switch (mode) {
            case 'all':
                return `1-${totalLines}`;
            
            case 'none':
                return '';
            
            case 'line-by-line':
                // Progressive highlighting: 1|2|3|4...
                return Array.from({length: totalLines}, (_, i) => i + 1).join('|');
            
            case 'block':
                // Highlight code blocks separated by empty lines
                return this.detectBlocks(lines);
            
            case 'function':
                // Detect function boundaries (heuristic)
                return this.detectFunctions(lines);
            
            case 'class':
                // Detect class boundaries (heuristic)
                return this.detectClasses(lines);
            
            default:
                return '';
        }
    }

    /**
     * Detect code blocks separated by empty lines
     * @param lines Array of code lines
     * @returns Reveal.js line pattern
     */
    private detectBlocks(lines: string[]): string {
        const blocks: string[] = [];
        let blockStart = 1;
        let inBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.length > 0) {
                if (!inBlock) {
                    blockStart = i + 1;
                    inBlock = true;
                }
            } else if (inBlock) {
                // Empty line marks end of block
                blocks.push(blockStart === i ? `${blockStart}` : `${blockStart}-${i}`);
                inBlock = false;
            }
        }
        
        // Handle last block
        if (inBlock) {
            blocks.push(blockStart === lines.length ? `${blockStart}` : `${blockStart}-${lines.length}`);
        }
        
        return blocks.join('|');
    }

    /**
     * Detect function boundaries (simple heuristic)
     * @param lines Array of code lines
     * @returns Reveal.js line pattern
     */
    private detectFunctions(lines: string[]): string {
        const functions: string[] = [];
        let funcStart = -1;
        let braceCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect function start (simple heuristic for common languages)
            if (funcStart === -1 && (
                /^(function|def|fn|func|public|private|protected|static)/.test(line) ||
                /\bfunction\b/.test(line) ||
                /^[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)\s*\{/.test(line) ||
                /^(async\s+)?[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)\s*(=>|:)/.test(line)
            )) {
                funcStart = i + 1;
            }
            
            if (funcStart !== -1) {
                // Count braces to find function end
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                
                if (braceCount === 0 && /\}/.test(line)) {
                    functions.push(funcStart === i + 1 ? `${funcStart}` : `${funcStart}-${i + 1}`);
                    funcStart = -1;
                }
            }
        }
        
        return functions.join('|') || '1';
    }

    /**
     * Detect class boundaries (simple heuristic)
     * @param lines Array of code lines
     * @returns Reveal.js line pattern
     */
    private detectClasses(lines: string[]): string {
        const classes: string[] = [];
        let classStart = -1;
        let braceCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect class start
            if (classStart === -1 && /^(class|interface|struct|enum)\s+[a-zA-Z_]/.test(line)) {
                classStart = i + 1;
            }
            
            if (classStart !== -1) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                
                if (braceCount === 0 && /\}/.test(line)) {
                    classes.push(classStart === i + 1 ? `${classStart}` : `${classStart}-${i + 1}`);
                    classStart = -1;
                }
            }
        }
        
        return classes.join('|') || '1';
    }

    /**
     * Get video MIME type from file extension
     * @param url The video URL
     * @returns The MIME type
     */
    private getVideoType(url: string): string {
        if (url.toLowerCase().endsWith('.webm')) return 'webm';
        if (url.toLowerCase().endsWith('.ogg')) return 'ogg';
        if (url.toLowerCase().endsWith('.mov')) return 'quicktime';
        return 'mp4'; // default
    }
}

/**
 * This class is responsible for processing inline text formatting.
 * It handles bold, italic, and underline formatting.
 */
export class TextProcessor {
    public processInlineText(text: string): string {
        // First escape HTML entities
        let result = this.escapeHtml(text);
        // Process bold (**text**)
        result = this.processBold(result);
        // Process underline (__text__)
        result = this.processUnderline(result);
        // Process italic (*text* or _text_)
        result = this.processItalic(result);
        return result;
    }

    /**
     * Found a bold pattern in the text and replace it with <strong> tags
     * @param text The text to process
     * @returns The processed text
     */
    private processBold(text: string): string {
        // Match ** but not *** (which would be bold+italic)
        return text.replace(/\*\*(?!\*)(.+?)(?<!\*)\*\*/g, '<strong>$1</strong>');
    }

    /**
     * Found an italic pattern in the text and replace it with <em> tags
     * Supports both *text* and _text_ syntax
     * @param text The text to process
     * @returns The processed text
     */
    private processItalic(text: string): string {
        // Process *italic* but not ** (bold) or <strong>*text*</strong>
        let result = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        // Process _italic_ but not __ (underline)
        result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
        return result;
    }

    /**
     * Found an underline pattern in the text and replace it with <u> tags
     * @param text The text to process
     * @returns The processed text
     */
    private processUnderline(text: string): string {
        return text.replace(/__(.+?)__/g, '<u>$1</u>');
    }

    /**
     * Escape HTML entities in the text
     * @param text The text to escape
     * @returns The escaped text
     */
    public escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}