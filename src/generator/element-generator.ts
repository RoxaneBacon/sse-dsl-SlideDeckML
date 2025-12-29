
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
        const match = content.match(/```([a-zA-Z][a-zA-Z0-9\-]*)?(?:\s*\[([^\]]*)\])?\s*[\r\n]([\s\S]*?)```/);
        if (!match) return '';
        
        const language = match[1] || '';
        const attributes = match[2] || '';
        const code = match[3] || '';

        // Build the class attribute
        const languageClass = language ? ` class="language-${language}"` : '';

        // Build data attributes for line numbers
        let dataAttrs = ' data-trim data-noescape';
        
        if (attributes) {
            // Parse attributes - formats: 'lines:value' or 'lines:value' 'start:value'
            // Remove surrounding quotes and split by spaces to handle multiple attributes
            const attrParts = attributes.match(/'[^']+'/g) || [];

            for (const part of attrParts) {
                // Remove quotes and parse
                const cleanPart = part.replace(/^'|'$/g, '');

                // Check for lines attribute
                const linesMatch = cleanPart.match(/^lines:(.+)$/);
                if (linesMatch) {
                    dataAttrs += ` data-line-numbers="${linesMatch[1]}"`;
                }

                // Check for start attribute
                const startMatch = cleanPart.match(/^start:(\d+)$/);
                if (startMatch) {
                    dataAttrs += ` data-line-numbers data-ln-start-from="${startMatch[1]}"`;
                }
            }
        }

        // Escape HTML in code content
        const escapedCode = this.textProcessor.escapeHtml(code);

        return `            <pre${style}><code${languageClass}${dataAttrs}>${escapedCode}</code></pre>`;
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