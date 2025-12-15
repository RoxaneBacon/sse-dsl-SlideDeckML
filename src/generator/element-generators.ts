import {
    Heading,
    Paragraph,
    PointedList,
    OrderedList,
    Quote
} from '../language/generated/ast.js';
import { TextProcessor } from './text-processor.js';

export class ElementGenerator {
    static generateHeading(heading: Heading): string {
        const level = heading.level.length;
        return `            <h${level}>${TextProcessor.processInlineText(heading.text)}</h${level}>`;
    }

    static generateParagraph(paragraph: Paragraph): string {
        return `            <p>${TextProcessor.processInlineText(paragraph.text)}</p>`;
    }

    static generatePointedList(list: PointedList): string {
        const items = list.items
            .map(item => `                <li>${TextProcessor.processInlineText(item.text)}</li>`)
            .join('\n');
        return `            <ul>\n${items}\n            </ul>`;
    }

    static generateOrderedList(list: OrderedList): string {
        const items = list.items
            .map(item => `                <li>${TextProcessor.processInlineText(item.text)}</li>`)
            .join('\n');
        return `            <ol>\n${items}\n            </ol>`;
    }

    static generateQuote(quote: Quote): string {
        return `            <blockquote>${TextProcessor.processInlineText(quote.text)}</blockquote>`;
    }
}

