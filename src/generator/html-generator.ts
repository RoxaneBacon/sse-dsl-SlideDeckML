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
     * @returns Complete HTML document string
     */
    public generateHTML(presentation: Presentation): string {
        if (presentation.metadata) {
            this.templateGenerator.setMetadata(presentation.metadata);
        }

        // Reset slide index counter
        this.sectionGenerator.resetSlideIndex();

        // Generate template if it exists
        let allSlidesHTML = '';
        if (presentation.template) {
            allSlidesHTML += this.sectionGenerator.generateSection(presentation.template, true) + '\n';
        }

        // Generate regular slides with index tracking
        const slidesHTML = presentation.slides.map((slide: Slide) => {
            const html = this.sectionGenerator.generateSection(slide, false);
            this.sectionGenerator.incrementSlideIndex();
            return html;
        }).join("\n");

        allSlidesHTML += slidesHTML;

        return this.templateGenerator.getHTMLTemplate(allSlidesHTML);
    }
}
