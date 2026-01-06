import { Block, Slide, Template } from "../language/generated/ast";
import { LineContentHandler } from "./line-content-handler";

/**
 * Handles the generation of HTML sections (slides)
 */
export class SectionGenerator {
    private lineContentHandler: LineContentHandler;
    private currentSlideIndex = 0;

    constructor(lineContentHandler: LineContentHandler) {
        this.lineContentHandler = lineContentHandler;
    }

    /**
     * Generate HTML for a slide or template section
     * @param slideOrTemplate The slide or template to generate
     * @param isTemplate Whether this is a template section
     * @returns Generated HTML string
     */
    public generateSection(slideOrTemplate: Slide | Template, isTemplate: boolean): string {
        const contentHTML = slideOrTemplate.blocks
            .map(block => this.generateBlock(block))
            .join('\n');

        // Add data-slide-index attribute for regular slides (not template)
        const dataAttribute = isTemplate ? '' : ` data-slide-index="${this.currentSlideIndex}"`;

        return `        <section${dataAttribute}>\n${contentHTML}\n        </section>`;
    }

    /**
     * Generate HTML for a block
     * @param block The block to generate
     * @returns Generated HTML string
     */
    private generateBlock(block: Block): string {
        let html = '';

        if (block.lines.length > 0) {
            html += block.lines.map(line => this.lineContentHandler.generateLine(line)).join('\n');
        }

        return html;
    }

    /**
     * Increment the slide index counter
     */
    public incrementSlideIndex(): void {
        this.currentSlideIndex++;
    }

    /**
     * Reset the slide index counter
     */
    public resetSlideIndex(): void {
        this.currentSlideIndex = 0;
    }

    /**
     * Get the current slide index
     */
    public getCurrentSlideIndex(): number {
        return this.currentSlideIndex;
    }
}
