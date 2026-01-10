import { Block, Slide } from "../language/generated/ast";
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
     * Get the line content handler
     */
    public getLineContentHandler(): LineContentHandler {
        return this.lineContentHandler;
    }

    /**
     * Generate HTML for a slide section
     * @param slide The slide to generate
     * @returns Generated HTML string
     */
    public async generateSection(slide: Slide): Promise<string> {
        const blockPromises = slide.blocks.map(block => this.generateBlock(block));
        const contentHTML = (await Promise.all(blockPromises)).join('\n');

        return `        <section data-slide-index="${this.currentSlideIndex}">\n${contentHTML}\n        </section>`;
    }

    /**
     * Generate HTML for a block
     * @param block The block to generate
     * @returns Generated HTML string
     */
    private async generateBlock(block: Block): Promise<string> {
        let html = '';

        if (block.lines.length > 0) {
            const linePromises = block.lines.map(line => this.lineContentHandler.generateLine(line));
            html += (await Promise.all(linePromises)).join('\n');
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
