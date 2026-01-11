import { Presentation, Slide, isCodeBlock, isSyncFragments, isStyledElement, isFragmentElement, LineContent, Editor, Output } from "../language/generated/ast";
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
        const lineContentHandler = new LineContentHandler(elementGenerator, styleParser, this.templateGenerator.getIdeRuntime());
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

        // Detect feature usage in the presentation
        this.detectFeatureUsage(presentation);

        // Reset slide index counter
        this.sectionGenerator.resetSlideIndex();

        // Generate slides with index tracking
        const slidesPromises = (presentation.slides?.slides || []).map(async (slide: Slide) => {
            const html = await this.sectionGenerator.generateSection(slide);
            this.sectionGenerator.incrementSlideIndex();
            return html;
        });
        
        const slidesHTML = (await Promise.all(slidesPromises)).join("\n");

        return this.templateGenerator.getHTMLTemplate(slidesHTML);
    }

    /**
     * Detect which features are used in the presentation and enable them in the template
     * @param presentation The presentation AST
     */
    private detectFeatureUsage(presentation: Presentation): void {
        const slides = presentation.slides?.slides || [];
        
        for (const slide of slides) {
            for (const block of slide.blocks) {
                for (const line of block.lines) {
                    this.checkLineForFeatures(line);
                }
            }
        }
    }

    /**
     * Recursively check a line and its nested elements for feature usage
     * @param line The line content to check
     */
    private checkLineForFeatures(line: LineContent | Editor | Output): void {
        // Check for LaTeX code blocks
        if (isCodeBlock(line)) {
            if (line.content.match(/```latex/i)) {
                this.templateGenerator.enableLatex();
            }
        }
        
        // Check for synchronized fragments
        if (isSyncFragments(line)) {
            this.templateGenerator.enableSyncFragments();
        }
        
        // Recursively check styled elements
        if (isStyledElement(line)) {
            for (const element of line.elements) {
                this.checkLineForFeatures(element);
            }
        }
        
        // Recursively check fragment elements
        if (isFragmentElement(line)) {
            for (const element of line.elements) {
                this.checkLineForFeatures(element);
            }
        }
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
