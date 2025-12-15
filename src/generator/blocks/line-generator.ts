import { AstNode } from 'langium';
import { BlockGenerator, escapeHtml } from './types.js';

/**
 * Interface for LineHeading AST node
 */
export interface LineHeading extends AstNode {
    $type: 'LineHeading';
    level: string;
    text: string;
}

/**
 * Interface for LineParagraph AST node
 */
export interface LineParagraph extends AstNode {
    $type: 'LineParagraph';
    text: string;
}

/**
 * Union type for all Line types
 */
export type Line = LineHeading | LineParagraph;

/**
 * Generator for Line blocks (headings and paragraphs)
 */
export class LineGenerator implements BlockGenerator<Line> {
    /**
     * Generates HTML for a Line block
     */
    generate(line: Line): string {
        if (line.$type === 'LineHeading') {
            return this.generateHeading(line as LineHeading);
        } else if (line.$type === 'LineParagraph') {
            return this.generateParagraph(line as LineParagraph);
        }
        return '';
    }

    /**
     * Generates HTML for a heading
     */
    private generateHeading(heading: LineHeading): string {
        // Extract heading level from marker (# = 1, ## = 2, ### = 3)
        const level = heading.level.trim().length;
        // text is a string composed from tokens, just use it directly
        const text = (heading.text as any).trim();
        return `            <h${level}>${escapeHtml(text)}</h${level}>`;
    }

    /**
     * Generates HTML for a paragraph
     */
    private generateParagraph(paragraph: LineParagraph): string {
        // text is a string composed from tokens, just use it directly
        const text = (paragraph.text as any).trim();
        return `            <p>${escapeHtml(text)}</p>`;
    }
}
