import { Presentation, Slide } from "../language/generated/ast";
import { ElementGenerator } from "./element-generator";
import { TemplateGenerator } from "./template";
import { StyleParser } from "./style-parser";
import { LineContentHandler } from "./line-content-handler";
import { SectionGenerator } from "./section-generator";

/**
 * Main HTML generator that orchestrates the conversion of SlideDeckML to HTML
 */
export class HtmlGenerator {
    private templateGenerator: TemplateGenerator;
    private sectionGenerator: SectionGenerator;

    constructor() {
        this.templateGenerator = new TemplateGenerator();
        
        // Initialize the dependency chain
        const elementGenerator = new ElementGenerator();
        const styleParser = new StyleParser();
        const lineContentHandler = new LineContentHandler(elementGenerator, styleParser);
        this.sectionGenerator = new SectionGenerator(lineContentHandler);
    }

    /**
     * Generate complete HTML presentation from SlideDeckML AST
     * @param presentation The presentation AST
     * @param sourceFilePath Absolute path to the source .sdml file (for resolving relative image paths)
     * @returns Complete HTML document string
     */
    public async generateHTML(presentation: Presentation, sourceFilePath?: string): Promise<string> {
        if (presentation.metadata) {
            this.templateGenerator.setMetadata(presentation.metadata);
        }

        // Set source file path for image resolution
        if (sourceFilePath) {
            this.templateGenerator.setSourceFilePath(sourceFilePath);
            this.setSourceFilePath(sourceFilePath);
        }

        // Reset slide index counter
        this.sectionGenerator.resetSlideIndex();

        // Generate template if it exists
        let allSlidesHTML = '';
        if (presentation.template) {
            allSlidesHTML += await this.sectionGenerator.generateSection(presentation.template, true) + '\n';
        }

        // Generate regular slides with index tracking
        const slidesPromises = presentation.slides.map(async (slide: Slide) => {
            const html = await this.sectionGenerator.generateSection(slide, false);
            this.sectionGenerator.incrementSlideIndex();
            return html;
        });
        
        const slidesHTML = (await Promise.all(slidesPromises)).join("\n");

        allSlidesHTML += slidesHTML;

        return this.templateGenerator.getHTMLTemplate(allSlidesHTML);
    }

    /**
     * Set the source file path for resolving relative image paths
     * @param sourceFilePath Absolute path to the source .sdml file
     */
    private setSourceFilePath(sourceFilePath: string): void {
        const lineContentHandler = this.sectionGenerator.getLineContentHandler();
        const elementGenerator = lineContentHandler.getElementGenerator();
        elementGenerator.setSourceFilePath(sourceFilePath);
    }
}
