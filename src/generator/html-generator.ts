import { AstNode } from 'langium';
import { LineGenerator, MediaGenerator, Line, Media } from './blocks/index.js';

/**
 * Interface for Block AST node (union type)
 */
interface Block extends AstNode {
    $type: 'Line' | 'Media' | 'LineHeading' | 'LineParagraph';
}

/**
 * Interface for Slide AST node
 */
interface Slide extends AstNode {
    $type: 'Slide';
    blocks: Block[];
}

/**
 * Interface for Header AST node
 */
interface Header extends AstNode {
    $type: 'Header';
    title?: string;
    author?: string;
}

/**
 * Interface for Presentation AST node
 */
interface Presentation extends AstNode {
    $type: 'Presentation';
    header?: Header;
    slides: Slide[];
}

/**
 * Main HTML generator for presentations
 */
export class HtmlGenerator {
    private lineGenerator = new LineGenerator();
    private mediaGenerator = new MediaGenerator();

    /**
     * Generates complete HTML for a presentation
     */
    generateHTML(presentation: Presentation): string {
        const slidesHTML = presentation.slides
            .map(slide => this.generateSlide(slide))
            .join('\n');

        const title = presentation.header?.title;
        const author = presentation.header?.author;

        return this.getHTMLTemplate(slidesHTML, title, author);
    }

    /**
     * Generates HTML for a single slide
     */
    private generateSlide(slide: Slide): string {
        const blocksHTML = slide.blocks
            .map(block => this.generateBlock(block))
            .join('\n');

        return `        <section>\n${blocksHTML}\n        </section>`;
    }

    /**
     * Generates HTML for a single block
     */
    private generateBlock(block: Block): string {
        // Check if it's a Line (LineHeading or LineParagraph)
        if (block.$type === 'LineHeading' || block.$type === 'LineParagraph') {
            return this.lineGenerator.generate(block as Line);
        }
        // Check if it's a Media
        else if (block.$type === 'Media') {
            return this.mediaGenerator.generate(block as Media);
        }

        return '';
    }

    /**
     * Generates the HTML template with reveal.js
     */
    private getHTMLTemplate(slidesContent: string, title?: string, author?: string): string {
        const pageTitle = title ? this.extractQuotedString(title) : 'SlideDeckML Presentation';
        const authorComment = author ? `<!-- Author: ${this.escapeHtml(this.extractQuotedString(author))} -->\n    ` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/black.css">
</head>
<body>
    ${authorComment}<div class="reveal">
        <div class="slides">
${slidesContent}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: 'slide',
            backgroundTransition: 'fade'
        });
    </script>
</body>
</html>`;
    }

    /**
     * Extracts content from a quoted string
     */
    private extractQuotedString(quotedStr: string): string {
        if ((quotedStr.startsWith('"') && quotedStr.endsWith('"')) ||
            (quotedStr.startsWith("'") && quotedStr.endsWith("'"))) {
            return quotedStr.slice(1, -1);
        }
        return quotedStr;
    }

    /**
     * Escapes HTML special characters
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

/**
 * Helper function for backwards compatibility
 */
export function generateHTML(presentation: Presentation): string {
    const generator = new HtmlGenerator();
    return generator.generateHTML(presentation);
}
