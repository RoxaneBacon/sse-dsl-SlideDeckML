
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
    public generateHeading(heading: any): string {
        // Access level and text directly from the AST
        const level = heading.level.length;
        const text = heading.text;
        
        return `            <h${level}>${this.textProcessor.processInlineText(text)}</h${level}>`;
    }

    /**
     * Generate a paragraph element
     * @param paragraph The paragraph AST node
     * @returns The HTML string for the paragraph
     */
    public generateParagraph(paragraph: any): string {
        return `            <p>${this.textProcessor.processInlineText(paragraph.text)}</p>`;
    }

    /**
     * Generate a pointed list element
     * @param list The pointed list AST node
     * @returns The HTML string for the pointed list
     */
    public generatePointedList(list: any): string {
        const items = list.items
            .map((item: any) => {
                // Access text directly from the AST
                const text = item.text;
                return `                <li>${this.textProcessor.processInlineText(text)}</li>`;
            })
            .join('\n');
        return `            <ul>\n${items}\n            </ul>`;
    }

    /**
     * Generate an ordered list element
     * @param list The ordered list AST node
     * @returns The HTML string for the ordered list
     */
    public generateOrderedList(list: any): string {
        const items = list.items
            .map((item: any) => {
                // Access text directly from the AST
                const text = item.text;
                return `                <li>${this.textProcessor.processInlineText(text)}</li>`;
            })
            .join('\n');
        return `            <ol>\n${items}\n            </ol>`;
    }

    /**
     * Generate a quote element
     * @param quote The quote AST node
     * @returns The HTML string for the quote
     */
    public generateQuote(quote: any): string {
        const text = quote.text;
        return `            <blockquote>${this.textProcessor.processInlineText(text)}</blockquote>`;
    }

    /**
     * Generate a media element (image or video)
     * @param media The media AST node
     * @returns The HTML string for the media
     */
    public generateMedia(media: any): string {
        const content = media.content;
        console.log('Media content:', JSON.stringify(content));
        
        // Parse the media line: ![alt](url)
        const match = content.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
        if (!match) return '';
        
        const alt = match[1];
        const url = match[2];
        console.log('Alt:', alt, '| URL:', url);
        
        // Determine if it's a video based on file extension
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const isVideo = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
        
        if (isVideo) {
            return `            <video controls>\n                <source src="${url}" type="video/${this.getVideoType(url)}">\n                ${alt}\n            </video>`;
        } else {
            return `            <img src="${url}" alt="${alt}">`;
        }
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
        // Process italic (*text* or _text_)
        result = this.processItalic(result);
        // Process underline (__text__)
        result = this.processUnderline(result);
        return result;
    }

    /**
     * Found a bold pattern in the text and replace it with <strong> tags
     * @param text The text to process
     * @returns The processed text
     */
    private processBold(text: string): string {
        return text.replace(/\*\*([^*\r\n]+)\*\*/g, '<strong>$1</strong>');
    }

    /**
     * Found an italic pattern in the text and replace it with <em> tags
     * Supports both *text* and _text_ syntax
     * @param text The text to process
     * @returns The processed text
     */
    private processItalic(text: string): string {
        // Process *italic*
        let result = text.replace(/\*([^*\r\n]+)\*/g, '<em>$1</em>');
        // Process _italic_
        result = result.replace(/_([^_\r\n]+)_/g, '<em>$1</em>');
        return result;
    }

    /**
     * Found an underline pattern in the text and replace it with <u> tags
     * @param text The text to process
     * @returns The processed text
     */
    private processUnderline(text: string): string {
        return text.replace(/__([^_\r\n]+)__/g, '<u>$1</u>');
    }

    /**
     * Escape HTML entities in the text
     * @param text The text to escape
     * @returns The escaped text
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}