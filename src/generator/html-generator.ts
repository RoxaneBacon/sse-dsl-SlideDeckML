import { Block, Header, LineContent, UnorderedList, Presentation, Slide, Template, OrderedList, isHeader, isUnorderedList, isOrderedList, isParagraph } from "../language/generated/ast";
import { ElementGenerator } from "./element-generator";
import { TemplateGenerator } from "./template";

export class HtmlGenerator {
    templateGenerator = new TemplateGenerator();
    elementGenerator = new ElementGenerator();

    public generateHTML(presentation: Presentation): string {
        if (presentation.metadata) this.templateGenerator.setMetadata(presentation.metadata);

        // Generate template if it exists
        let allSlidesHTML = '';
        if (presentation.template) {
            allSlidesHTML += this.generateSection(presentation.template) + '\n';
        }

        // Generate regular slides
        const slidesHTML = presentation.slides.map(
            (slide: Slide) => this.generateSection(slide))
        .join("\n");

        allSlidesHTML += slidesHTML;

        return this.templateGenerator.getHTMLTemplate(allSlidesHTML);
    }


    private generateSection(slideOrTemplate: Slide | Template): string {
        const contentHTML = slideOrTemplate.blocks
            .map(block => this.generateBlock(block))
            .join('\n');

        return `        <section>\n${contentHTML}\n        </section>`;
    }

    private generateBlock(block: Block): string {
        let html = '';

        if (block.lines.length > 0) {
            html += block.lines.map(line => this.generateLine(line)).join('\n');
        }

        return html;
    }

    /**
     * Process for a single line, and found the type of element to generate
     * @param line 
     */
    private generateLine(line: LineContent): string {
        if (isHeader(line)) {
            return this.elementGenerator.generateHeading(line);
        }
        if (isUnorderedList(line)) {
            return this.elementGenerator.generatePointedList(line);
        }
        if (isOrderedList(line)) {
            return this.elementGenerator.generateOrderedList(line);
        }
        if (isParagraph(line)) {
            return this.elementGenerator.generateParagraph(line);
        }
        return '';
    }
}