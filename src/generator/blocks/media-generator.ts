import { AstNode } from 'langium';
import { BlockGenerator, escapeHtml } from './types.js';

/**
 * Interface for Media AST node
 */
export interface Media extends AstNode {
    $type: 'Media';
    alt: string;
    url: string;
}

/**
 * Generator for Media blocks (images)
 */
export class MediaGenerator implements BlockGenerator<Media> {
    /**
     * Generates HTML for a Media block
     */
    generate(media: Media): string {
        const url = this.extractQuotedString(media.url);
        const alt = media.alt || 'Image';
        return `            <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="max-width: 100%; height: auto;" />`;
    }

    /**
     * Extracts content from a quoted string
     */
    private extractQuotedString(quotedStr: string): string {
        // Remove surrounding quotes (single or double)
        if ((quotedStr.startsWith('"') && quotedStr.endsWith('"')) ||
            (quotedStr.startsWith("'") && quotedStr.endsWith("'"))) {
            return quotedStr.slice(1, -1);
        }
        return quotedStr;
    }
}
