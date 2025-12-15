import {
    SlideDeck,
    Slide,
    Block,
    Line,
    isHeading,
    isParagraph,
    isPointedList,
    isOrderedList,
    isQuote
} from '../language/generated/ast.js';
import { TemplateGenerator } from './template.js';
import { ElementGenerator } from './element-generators.js';
import { MediaGenerator } from './media-generators.js';

export class HTMLGenerator {
    static generateHTML(slideDeck: SlideDeck): string {
        const slidesHTML = slideDeck.slides
            .map(slide => this.generateSlide(slide))
            .join('\n');

        return TemplateGenerator.getHTMLTemplate(slidesHTML);
    }

    private static generateSlide(slide: Slide): string {
        const contentHTML = slide.blocks
            .map(block => this.generateBlock(block))
            .join('\n');

        return `        <section>\n${contentHTML}\n        </section>`;
    }

    private static generateBlock(block: Block): string {
        let html = '';

        if (block.lines.length > 0) {
            html += block.lines.map(line => this.generateLine(line)).join('\n');
        }

        if (block.media.length > 0) {
            html += block.media.map(media => MediaGenerator.generateMedia(media)).join('\n');
        }

        return html;
    }

    private static generateLine(line: Line): string {
        if (isHeading(line)) return ElementGenerator.generateHeading(line);
        if (isParagraph(line)) return ElementGenerator.generateParagraph(line);
        if (isPointedList(line)) return ElementGenerator.generatePointedList(line);
        if (isOrderedList(line)) return ElementGenerator.generateOrderedList(line);
        if (isQuote(line)) return ElementGenerator.generateQuote(line);
        return '';
    }
}

// Keep backward compatibility by exporting the main function
export function generateHTML(slideDeck: SlideDeck): string {
    return HTMLGenerator.generateHTML(slideDeck);
}

