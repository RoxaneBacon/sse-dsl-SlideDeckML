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
    isFragmentElement,
    isCodeBlock, 
    isSyncFragments,
    isComponentUsage 
} from "../language/generated/ast";
import { ElementGenerator } from "./element-generator";
import { StyleParser } from "./style-parser";
import { FragmentParser } from "./fragment-parser";
import { ComponentProcessor } from "./component-processor";

/**
 * Handles the generation of HTML for different types of line content
 */
export class LineContentHandler {
    private elementGenerator: ElementGenerator;
    private styleParser: StyleParser;
    private fragmentParser: FragmentParser;
    private lastCodeBlock: CodeBlock | null = null;
    private componentProcessor: ComponentProcessor;

    constructor(elementGenerator: ElementGenerator, styleParser: StyleParser, componentProcessor: ComponentProcessor) {
        this.elementGenerator = elementGenerator;
        this.styleParser = styleParser;
        this.fragmentParser = new FragmentParser();
        this.componentProcessor = componentProcessor;
    }

    /**
     * Get the element generator
     */
    public getElementGenerator(): ElementGenerator {
        return this.elementGenerator;
    }

    /**
     * Process a single line and generate appropriate HTML
     * @param line The line content to process
     * @returns Generated HTML string
     */
    public async generateLine(line: LineContent): Promise<string> {
        // Handle component usage
        if (isComponentUsage(line)) {
            return await this.handleComponentUsage(line);
        }
        
        // Handle fragment elements first
        if (isFragmentElement(line)) {
            return await this.handleFragmentElement(line);
        }
        
        // Handle styled elements
        if (isStyledElement(line)) {
            return await this.handleStyledElement(line);
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
            return await this.elementGenerator.generateMedia(line);
        }
        if (isCodeBlock(line)) {
            this.lastCodeBlock = line;
            return this.elementGenerator.generateCodeBlock(line);
        }
        if (isSyncFragments(line)) {
            return await this.elementGenerator.generateSyncFragments(line, this.lastCodeBlock);
        }
        if (isParagraph(line)) {
            return await this.elementGenerator.generateParagraph(line);
        }
        return '';
    }

    /**
     * Handle styled element containing multiple child elements
     * @param line The styled element
     * @returns Generated HTML string
     */
    private async handleStyledElement(line: any): Promise<string> {
        const style = this.styleParser.parseStyle(line.style);
        const elements = line.elements || [];
        
        let containerHtml = `            <div${style}>\n`;
        
        for (const element of elements) {
            if (isFragmentElement(element)) {
                // Handle nested fragments
                containerHtml += await this.handleFragmentElement(element) + '\n';
            } else if (isStyledElement(element)) {
                // Handle nested styled elements
                containerHtml += await this.handleStyledElement(element) + '\n';
            } else if (isHeader(element)) {
                containerHtml += this.elementGenerator.generateHeading(element, '') + '\n';
            } else if (isUnorderedList(element)) {
                containerHtml += this.elementGenerator.generatePointedList(element, '') + '\n';
            } else if (isOrderedList(element)) {
                containerHtml += this.elementGenerator.generateOrderedList(element, '') + '\n';
            } else if (isQuote(element)) {
                containerHtml += this.elementGenerator.generateQuote(element, '') + '\n';
            } else if (isMedia(element)) {
                containerHtml += await this.elementGenerator.generateMedia(element, '') + '\n';
            } else if (isCodeBlock(element)) {
                this.lastCodeBlock = element;
                containerHtml += this.elementGenerator.generateCodeBlock(element, '') + '\n';
            } else if (isSyncFragments(element)) {
                containerHtml += await this.elementGenerator.generateSyncFragments(element, this.lastCodeBlock) + '\n';
            } else if (isParagraph(element)) {
                containerHtml += await this.elementGenerator.generateParagraph(element, '') + '\n';
            }
        }
        
        containerHtml += `            </div>`;
        return containerHtml;
    }

    /**
     * Handle fragment element containing multiple child elements
     * @param line The fragment element
     * @returns Generated HTML string
     */
    private async handleFragmentElement(line: any): Promise<string> {
        const fragmentAttrs = this.fragmentParser.parseFragment(line.fragment);
        const elements = line.elements || [];
        
        let containerHtml = `            <div${fragmentAttrs.class}${fragmentAttrs.dataAttrs}>\n`;
        
        for (const element of elements) {
            if (isFragmentElement(element)) {
                // Handle nested fragments
                containerHtml += await this.handleFragmentElement(element) + '\n';
            } else if (isStyledElement(element)) {
                // Handle nested styled elements
                containerHtml += await this.handleStyledElement(element) + '\n';
            } else if (isHeader(element)) {
                containerHtml += this.elementGenerator.generateHeading(element, '') + '\n';
            } else if (isUnorderedList(element)) {
                containerHtml += this.elementGenerator.generatePointedList(element, '') + '\n';
            } else if (isOrderedList(element)) {
                containerHtml += this.elementGenerator.generateOrderedList(element, '') + '\n';
            } else if (isQuote(element)) {
                containerHtml += this.elementGenerator.generateQuote(element, '') + '\n';
            } else if (isMedia(element)) {
                containerHtml += await this.elementGenerator.generateMedia(element, '') + '\n';
            } else if (isCodeBlock(element)) {
                this.lastCodeBlock = element;
                containerHtml += this.elementGenerator.generateCodeBlock(element, '') + '\n';
            } else if (isSyncFragments(element)) {
                containerHtml += await this.elementGenerator.generateSyncFragments(element, this.lastCodeBlock) + '\n';
            } else if (isParagraph(element)) {
                containerHtml += await this.elementGenerator.generateParagraph(element, '') + '\n';
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

    /**
     * Handle component usage by instantiating the component with parameters
     * @param usage The component usage
     * @returns Generated HTML string
     */
    private async handleComponentUsage(usage: any): Promise<string> {
        // Instantiate the component with provided parameters
        const instantiatedBlocks = this.componentProcessor.instantiateComponent(usage);
        
        // Generate HTML for each block
        let html = '';
        for (const block of instantiatedBlocks) {
            for (const line of block.lines) {
                const lineHtml = await this.generateLine(line);
                if (lineHtml) {
                    html += lineHtml + '\n';
                }
            }
        }
        
        return html.trimEnd();
    }
}
