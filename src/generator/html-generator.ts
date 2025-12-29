import { Block, Header, LineContent, UnorderedList, Presentation, Slide, Template, OrderedList, Quote, Media, StyledElement, CodeBlock, isHeader, isUnorderedList, isOrderedList, isParagraph, isQuote, isMedia, isStyledElement, isCodeBlock } from "../language/generated/ast";
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
        // Handle styled elements first
        if (isStyledElement(line)) {
            const style = this.parseStyle(line.style);
            const element = line.element;
            
            if (isHeader(element)) {
                return this.elementGenerator.generateHeading(element, style);
            }
            if (isUnorderedList(element)) {
                return this.elementGenerator.generatePointedList(element, style);
            }
            if (isOrderedList(element)) {
                return this.elementGenerator.generateOrderedList(element, style);
            }
            if (isQuote(element)) {
                return this.elementGenerator.generateQuote(element, style);
            }
            if (isMedia(element)) {
                return this.elementGenerator.generateMedia(element, style);
            }
            if (isCodeBlock(element)) {
                return this.elementGenerator.generateCodeBlock(element, style);
            }
            if (isParagraph(element)) {
                return this.elementGenerator.generateParagraph(element, style);
            }
        }
        
        // Handle regular unstyled elements
        if (isHeader(line)) {
            return this.elementGenerator.generateHeading(line);
        }
        if (isUnorderedList(line)) {
            return this.elementGenerator.generatePointedList(line);
        }
        if (isOrderedList(line)) {
            return this.elementGenerator.generateOrderedList(line);
        }
        if (isQuote(line)) {
            return this.elementGenerator.generateQuote(line);
        }
        if (isMedia(line)) {
            return this.elementGenerator.generateMedia(line);
        }
        if (isCodeBlock(line)) {
            return this.elementGenerator.generateCodeBlock(line);
        }
        if (isParagraph(line)) {
            return this.elementGenerator.generateParagraph(line);
        }
        return '';
    }

    /**
     * Parse style attributes from style block
     * @param styleBlock Style attributes like {color: 'red', top: 200} or {calque: 10, horizontal-margin: 200}
     * @returns HTML style attribute string
     */
    private parseStyle(styleBlock: string): string {
        if (!styleBlock) return '';
        
        try {
            // Remove outer braces
            const content = styleBlock.replace(/^\{|\}$/g, '').trim();
            if (!content) return '';
            
            // Parse key-value pairs
            const styles: string[] = [];
            let hasAbsoluteKeywords = false;
            
            const pairs = content.split(',').map(pair => {
                const [key, value] = pair.split(':').map(s => s.trim());
                // Remove quotes from values
                const cleanValue = value?.replace(/^['"]|['"]$/g, '');
                
                // Check for simplified keywords
                if (key === 'calque') {
                    hasAbsoluteKeywords = true;
                    return `z-index: ${cleanValue}`;
                } else if (key === 'horizontal-margin') {
                    hasAbsoluteKeywords = true;
                    return `left: ${cleanValue}px`;
                } else if (key === 'vertical-margin') {
                    hasAbsoluteKeywords = true;
                    return `top: ${cleanValue}px`;
                } else {
                    // Regular CSS property
                    return `${key}: ${cleanValue}`;
                }
            });
            
            // If absolute positioning keywords were used, add position: absolute
            if (hasAbsoluteKeywords) {
                styles.push('position: absolute');
            }
            
            styles.push(...pairs);
            
            return ` style="${styles.join('; ')}"`;
        } catch (e) {
            return '';
        }
    }
}