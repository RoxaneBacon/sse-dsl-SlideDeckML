import { Block, Header, LineContent, UnorderedList, Presentation, Slide, Template, OrderedList, Quote, Media, StyledElement, CodeBlock, SyncFragments, isHeader, isUnorderedList, isOrderedList, isParagraph, isQuote, isMedia, isStyledElement, isCodeBlock, isSyncFragments } from "../language/generated/ast";
import { ElementGenerator } from "./element-generator";
import { TemplateGenerator } from "./template";

export class HtmlGenerator {
    templateGenerator = new TemplateGenerator();
    elementGenerator = new ElementGenerator();
    private currentSlideIndex = 0;

    public generateHTML(presentation: Presentation): string {
        if (presentation.metadata) this.templateGenerator.setMetadata(presentation.metadata);

        // Reset slide index counter
        this.currentSlideIndex = 0;

        // Generate template if it exists
        let allSlidesHTML = '';
        if (presentation.template) {
            allSlidesHTML += this.generateSection(presentation.template, true) + '\n';
        }

        // Generate regular slides with index tracking
        const slidesHTML = presentation.slides.map(
            (slide: Slide) => {
                const html = this.generateSection(slide, false);
                this.currentSlideIndex++;
                return html;
            })
        .join("\n");

        allSlidesHTML += slidesHTML;

        return this.templateGenerator.getHTMLTemplate(allSlidesHTML);
    }


    private generateSection(slideOrTemplate: Slide | Template, isTemplate: boolean): string {
        const contentHTML = slideOrTemplate.blocks
            .map(block => this.generateBlock(block))
            .join('\n');

        // Add data-slide-index attribute for regular slides (not template)
        const dataAttribute = isTemplate ? '' : ` data-slide-index="${this.currentSlideIndex}"`;

        return `        <section${dataAttribute}>\n${contentHTML}\n        </section>`;
    }

    private lastCodeBlock: CodeBlock | null = null;

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
            const elements = line.elements || [];
            
            let containerHtml = `            <div${style}>\n`;
            
            for (const element of elements) {
                if (isHeader(element)) {
                    containerHtml += this.elementGenerator.generateHeading(element, '') + '\n';
                } else if (isUnorderedList(element)) {
                    containerHtml += this.elementGenerator.generatePointedList(element, '') + '\n';
                } else if (isOrderedList(element)) {
                    containerHtml += this.elementGenerator.generateOrderedList(element, '') + '\n';
                } else if (isQuote(element)) {
                    containerHtml += this.elementGenerator.generateQuote(element, '') + '\n';
                } else if (isMedia(element)) {
                    containerHtml += this.elementGenerator.generateMedia(element, '') + '\n';
                } else if (isCodeBlock(element)) {
                    this.lastCodeBlock = element;
                    containerHtml += this.elementGenerator.generateCodeBlock(element, '') + '\n';
                } else if (isSyncFragments(element)) {
                    containerHtml += this.elementGenerator.generateSyncFragments(element, this.lastCodeBlock) + '\n';
                } else if (isParagraph(element)) {
                    containerHtml += this.elementGenerator.generateParagraph(element, '') + '\n';
                }
            }
            
            containerHtml += `            </div>`;
            return containerHtml;
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
            this.lastCodeBlock = line;
            return this.elementGenerator.generateCodeBlock(line);
        }
        if (isSyncFragments(line)) {
            return this.elementGenerator.generateSyncFragments(line, this.lastCodeBlock);
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
            
            // Parse key-value pairs (support both semicolon and comma separators)
            const styles: string[] = [];
            let hasAbsoluteKeywords = false;
            
            // Split by semicolon or comma
            const pairs = content.split(/[;,]/).map(pair => pair.trim()).filter(pair => pair.length > 0);
            
            const processedStyles = pairs.map(pair => {
                const colonIndex = pair.indexOf(':');
                if (colonIndex === -1) return null;
                
                const key = pair.substring(0, colonIndex).trim();
                const value = pair.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
                
                // Check for simplified keywords
                if (key === 'calque') {
                    hasAbsoluteKeywords = true;
                    return `z-index: ${value}`;
                } else if (key === 'horizontal-margin') {
                    hasAbsoluteKeywords = true;
                    return `left: ${value}px`;
                } else if (key === 'vertical-margin') {
                    hasAbsoluteKeywords = true;
                    return `top: ${value}px`;
                } else {
                    // Regular CSS property
                    return `${key}: ${value}`;
                }
            }).filter(style => style !== null);
            
            // If absolute positioning keywords were used, add position: absolute
            if (hasAbsoluteKeywords) {
                styles.push('position: absolute');
            }
            
            styles.push(...processedStyles);
            
            return ` style="${styles.join('; ')}"`;
        } catch (e) {
            return '';
        }
    }
}