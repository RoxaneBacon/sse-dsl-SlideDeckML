import { AstNode } from 'langium';

/**
 * Base interface for all block generators
 */
export interface BlockGenerator<T extends AstNode> {
    /**
     * Generates HTML for a block
     * @param block The AST node to generate HTML for
     * @returns The generated HTML string
     */
    generate(block: T): string;
}

/**
 * Utility function to escape HTML special characters
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
