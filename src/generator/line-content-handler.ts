import { 
    LineContent, 
    CodeBlock,
    isHeader, 
    isUnorderedList, 
    isOrderedList, 
    isParagraph, 
    isQuote, 
    isMedia, 
    isStyledElement, 
    isCodeBlock, 
    isSyncFragments 
} from "../language/generated/ast";
import { ElementGenerator } from "./element-generator";
import { StyleParser } from "./style-parser";

/**
 * Handles the generation of HTML for different types of line content
 */
export class LineContentHandler {
    private elementGenerator: ElementGenerator;
    private styleParser: StyleParser;
    private lastCodeBlock: CodeBlock | null = null;

    constructor(elementGenerator: ElementGenerator, styleParser: StyleParser) {
        this.elementGenerator = elementGenerator;
        this.styleParser = styleParser;
    }

    /**
     * Process a single line and generate appropriate HTML
     * @param line The line content to process
     * @returns Generated HTML string
     */
    public generateLine(line: LineContent): string {
        // Handle styled elements first
        if (isStyledElement(line)) {
            return this.handleStyledElement(line);
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
     * Handle styled element containing multiple child elements
     * @param line The styled element
     * @returns Generated HTML string
     */
    private handleStyledElement(line: any): string {
        const style = this.styleParser.parseStyle(line.style);
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

    /**
     * Reset the last code block reference (useful between slides)
     */
    public resetLastCodeBlock(): void {
        this.lastCodeBlock = null;
    }
}
