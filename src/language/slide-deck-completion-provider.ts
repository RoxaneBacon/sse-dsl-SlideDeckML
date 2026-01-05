import { CompletionAcceptor, CompletionContext, CompletionValueItem, DefaultCompletionProvider, MaybePromise, NextFeature } from 'langium';
import { AbstractElement } from 'langium/lib/grammar/generated/ast';

export class SlideDeckMLCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(
        context: CompletionContext,
        next: NextFeature<AbstractElement>,
        acceptor: CompletionAcceptor
    ): MaybePromise<void> {
        
        const text = context.document.textDocument.getText();
        const offset = context.offset;
        const line = text.substring(0, offset).split('\n').pop() || '';
        const isStartOfLine = line.trim().length === 0;

        // Complete metadata keywords at start of document or after '{'
        if (this.isInMetadata(text, offset)) {
            this.completeMetadataKeywords(acceptor);
        }

        // Complete separators at start of line
        if (isStartOfLine) {
            this.completeSeparators(acceptor);
        }

        // Complete headers at start of line or after '#'
        if (isStartOfLine || line.match(/^#{1,3}$/)) {
            this.completeHeaders(acceptor);
        }

        // Complete list markers at start of line
        if (isStartOfLine) {
            this.completeListMarkers(acceptor);
        }

        // Complete style block delimiters
        if (line.trim() === '' || line.endsWith(':::')) {
            this.completeStyleBlock(acceptor);
        }

        // Complete code block with language suggestions
        if (line.match(/^`{0,2}$/) || isStartOfLine) {
            this.completeCodeBlocks(acceptor);
        }

        // Complete code block options after language identifier
        if (line.match(/^```[a-zA-Z0-9_\-]*\s*$/)) {
            this.completeCodeBlockOptions(acceptor);
        }

        // Complete image/media syntax
        if (line.endsWith('!') || line.endsWith('![')) {
            this.completeMediaSyntax(acceptor);
        }

        // Complete style attributes
        if (this.isInStyleAttributes(line)) {
            this.completeStyleAttributes(acceptor);
        }

        // Complete quote blocks
        if (isStartOfLine) {
            this.completeQuote(acceptor);
        }

        return super.completionFor(context, next, acceptor);
    }

    private isInMetadata(text: string, offset: number): boolean {
        const beforeCursor = text.substring(0, offset);
        const openBraces = (beforeCursor.match(/\{/g) || []).length;
        const closeBraces = (beforeCursor.match(/\}/g) || []).length;
        return openBraces > closeBraces && beforeCursor.indexOf('author') === -1 || beforeCursor.endsWith('{');
    }

    private isInStyleAttributes(line: string): boolean {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        return line.includes(':::') && openBraces > closeBraces;
    }

    private completeMetadataKeywords(acceptor: CompletionAcceptor): void {
        acceptor({
            label: 'author',
            kind: 14, // Keyword
            detail: 'Presentation author',
            insertText: 'author: "$1"',
            insertTextFormat: 2, // Snippet
            documentation: 'Define the author of the presentation'
        });

        acceptor({
            label: 'title',
            kind: 14,
            detail: 'Presentation title',
            insertText: 'title: "$1"',
            insertTextFormat: 2,
            documentation: 'Define the title of the presentation'
        });

        acceptor({
            label: 'metadata',
            kind: 15, // Snippet
            detail: 'Complete metadata block',
            insertText: '{ author: "$1" title: "$2" }',
            insertTextFormat: 2,
            documentation: 'Insert a complete metadata block with author and title'
        });
    }

    private completeSeparators(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '===',
            kind: 14,
            detail: 'Slide separator',
            insertText: '===\n$0',
            insertTextFormat: 2,
            documentation: 'Separator between slides'
        });

        acceptor({
            label: '---',
            kind: 14,
            detail: 'Template separator',
            insertText: '---\n$0',
            insertTextFormat: 2,
            documentation: 'Separator for template section'
        });
    }

    private completeHeaders(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '# Heading 1',
            kind: 15,
            detail: 'Level 1 header',
            insertText: '# $0',
            insertTextFormat: 2,
            documentation: 'Insert a level 1 heading'
        });

        acceptor({
            label: '## Heading 2',
            kind: 15,
            detail: 'Level 2 header',
            insertText: '## $0',
            insertTextFormat: 2,
            documentation: 'Insert a level 2 heading'
        });

        acceptor({
            label: '### Heading 3',
            kind: 15,
            detail: 'Level 3 header',
            insertText: '### $0',
            insertTextFormat: 2,
            documentation: 'Insert a level 3 heading'
        });
    }

    private completeListMarkers(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '- List item',
            kind: 15,
            detail: 'Unordered list',
            insertText: '- $0',
            insertTextFormat: 2,
            documentation: 'Insert an unordered list item'
        });

        acceptor({
            label: '* List item',
            kind: 15,
            detail: 'Unordered list (alternative)',
            insertText: '* $0',
            insertTextFormat: 2,
            documentation: 'Insert an unordered list item (alternative marker)'
        });

        acceptor({
            label: '1. Numbered item',
            kind: 15,
            detail: 'Ordered list',
            insertText: '1. $0',
            insertTextFormat: 2,
            documentation: 'Insert a numbered list item'
        });
    }

    private completeStyleBlock(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '::: Style block',
            kind: 15,
            detail: 'Styled element',
            insertText: ':::\n{$1}\n$2\n:::',
            insertTextFormat: 2,
            documentation: 'Insert a style block with custom CSS attributes'
        });
    }

    private completeCodeBlocks(acceptor: CompletionAcceptor): void {
        const languages = [
            { name: 'javascript', label: 'JavaScript' },
            { name: 'typescript', label: 'TypeScript' },
            { name: 'python', label: 'Python' },
            { name: 'java', label: 'Java' },
            { name: 'csharp', label: 'C#' },
            { name: 'cpp', label: 'C++' },
            { name: 'html', label: 'HTML' },
            { name: 'css', label: 'CSS' },
            { name: 'json', label: 'JSON' },
            { name: 'xml', label: 'XML' },
            { name: 'sql', label: 'SQL' },
            { name: 'bash', label: 'Bash' },
            { name: 'powershell', label: 'PowerShell' },
        ];

        acceptor({
            label: '``` Code block',
            kind: 15,
            detail: 'Fenced code block',
            insertText: '```$1\n$2\n```',
            insertTextFormat: 2,
            documentation: 'Insert a code block'
        });

        languages.forEach(lang => {
            acceptor({
                label: `\`\`\`${lang.name}`,
                kind: 15,
                detail: `${lang.label} code block`,
                insertText: `\`\`\`${lang.name}\n$1\n\`\`\``,
                insertTextFormat: 2,
                documentation: `Insert a ${lang.label} code block`
            });
        });
    }

    private completeCodeBlockOptions(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '[highlight: line-by-line]',
            kind: 15,
            detail: 'Line-by-line highlighting',
            insertText: ' [highlight: line-by-line]',
            insertTextFormat: 2,
            documentation: 'Highlight code line by line'
        });

        acceptor({
            label: '[highlight: block]',
            kind: 15,
            detail: 'Block highlighting',
            insertText: ' [highlight: block]',
            insertTextFormat: 2,
            documentation: 'Highlight entire code block'
        });

        acceptor({
            label: '[highlight: function]',
            kind: 15,
            detail: 'Function highlighting',
            insertText: ' [highlight: function]',
            insertTextFormat: 2,
            documentation: 'Highlight by function'
        });

        acceptor({
            label: '[lines: "1-5"]',
            kind: 15,
            detail: 'Highlight specific lines',
            insertText: ' [lines: "$1"]',
            insertTextFormat: 2,
            documentation: 'Highlight specific line ranges'
        });

        acceptor({
            label: '[start: 1]',
            kind: 15,
            detail: 'Start line number',
            insertText: ' [start: $1]',
            insertTextFormat: 2,
            documentation: 'Set starting line number for display'
        });
    }

    private completeMediaSyntax(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '![alt](url)',
            kind: 15,
            detail: 'Image/media',
            insertText: '![$1]($2)',
            insertTextFormat: 2,
            documentation: 'Insert an image or media element'
        });
    }

    private completeStyleAttributes(acceptor: CompletionAcceptor): void {
        const cssProps = [
            // Color & Background
            { prop: 'color', example: '#333', doc: 'Text color' },
            { prop: 'background-color', example: '#ffffff', doc: 'Background color' },
            { prop: 'background', example: 'linear-gradient(to right, #ff0000, #00ff00)', doc: 'Background with gradient' },
            { prop: 'opacity', example: '0.8', doc: 'Element opacity (0-1)' },
            
            // Typography
            { prop: 'font-size', example: '24px', doc: 'Font size' },
            { prop: 'font-weight', example: 'bold', doc: 'Font weight (normal, bold, 100-900)' },
            { prop: 'font-family', example: '"Arial", sans-serif', doc: 'Font family' },
            { prop: 'font-style', example: 'italic', doc: 'Font style (normal, italic, oblique)' },
            { prop: 'line-height', example: '1.6', doc: 'Line height' },
            { prop: 'letter-spacing', example: '2px', doc: 'Spacing between letters' },
            { prop: 'text-align', example: 'center', doc: 'Text alignment (left, center, right, justify)' },
            { prop: 'text-decoration', example: 'underline', doc: 'Text decoration' },
            { prop: 'text-transform', example: 'uppercase', doc: 'Text transformation' },
            { prop: 'text-shadow', example: '2px 2px 4px rgba(0,0,0,0.5)', doc: 'Text shadow effect' },
            
            // Box Model
            { prop: 'width', example: '100%', doc: 'Element width' },
            { prop: 'height', example: 'auto', doc: 'Element height' },
            { prop: 'max-width', example: '800px', doc: 'Maximum width' },
            { prop: 'max-height', example: '600px', doc: 'Maximum height' },
            { prop: 'min-width', example: '300px', doc: 'Minimum width' },
            { prop: 'min-height', example: '200px', doc: 'Minimum height' },
            { prop: 'padding', example: '20px', doc: 'Padding on all sides' },
            { prop: 'padding-top', example: '10px', doc: 'Top padding' },
            { prop: 'padding-right', example: '10px', doc: 'Right padding' },
            { prop: 'padding-bottom', example: '10px', doc: 'Bottom padding' },
            { prop: 'padding-left', example: '10px', doc: 'Left padding' },
            { prop: 'margin', example: '20px auto', doc: 'Margin on all sides' },
            { prop: 'margin-top', example: '10px', doc: 'Top margin' },
            { prop: 'margin-right', example: '10px', doc: 'Right margin' },
            { prop: 'margin-bottom', example: '10px', doc: 'Bottom margin' },
            { prop: 'margin-left', example: '10px', doc: 'Left margin' },
            
            // Border
            { prop: 'border', example: '2px solid #333', doc: 'Border on all sides' },
            { prop: 'border-radius', example: '10px', doc: 'Rounded corners' },
            { prop: 'border-top', example: '1px solid #ddd', doc: 'Top border' },
            { prop: 'border-right', example: '1px solid #ddd', doc: 'Right border' },
            { prop: 'border-bottom', example: '1px solid #ddd', doc: 'Bottom border' },
            { prop: 'border-left', example: '1px solid #ddd', doc: 'Left border' },
            { prop: 'border-color', example: '#333', doc: 'Border color' },
            { prop: 'border-width', example: '2px', doc: 'Border width' },
            { prop: 'border-style', example: 'solid', doc: 'Border style (solid, dashed, dotted)' },
            { prop: 'box-shadow', example: '0 4px 6px rgba(0,0,0,0.1)', doc: 'Box shadow effect' },
            
            // Positioning
            { prop: 'position', example: 'absolute', doc: 'Positioning type (static, relative, absolute, fixed)' },
            { prop: 'top', example: '0', doc: 'Distance from top' },
            { prop: 'right', example: '0', doc: 'Distance from right' },
            { prop: 'bottom', example: '0', doc: 'Distance from bottom' },
            { prop: 'left', example: '0', doc: 'Distance from left' },
            { prop: 'z-index', example: '10', doc: 'Stack order' },
            
            // Display & Layout
            { prop: 'display', example: 'flex', doc: 'Display type (block, inline, flex, grid, none)' },
            { prop: 'flex-direction', example: 'row', doc: 'Flex direction (row, column)' },
            { prop: 'justify-content', example: 'center', doc: 'Horizontal alignment in flex (flex-start, center, flex-end, space-between)' },
            { prop: 'align-items', example: 'center', doc: 'Vertical alignment in flex (flex-start, center, flex-end, stretch)' },
            { prop: 'flex-wrap', example: 'wrap', doc: 'Flex wrapping behavior' },
            { prop: 'gap', example: '20px', doc: 'Gap between flex/grid items' },
            { prop: 'grid-template-columns', example: 'repeat(3, 1fr)', doc: 'Grid column template' },
            { prop: 'grid-template-rows', example: 'auto', doc: 'Grid row template' },
            { prop: 'overflow', example: 'hidden', doc: 'Overflow behavior (visible, hidden, scroll, auto)' },
            { prop: 'overflow-x', example: 'hidden', doc: 'Horizontal overflow' },
            { prop: 'overflow-y', example: 'auto', doc: 'Vertical overflow' },
            
            // Transform & Animation
            { prop: 'transform', example: 'scale(1.1)', doc: 'Transform (scale, rotate, translate)' },
            { prop: 'transform-origin', example: 'center', doc: 'Transform origin point' },
            { prop: 'transition', example: 'all 0.3s ease', doc: 'CSS transition' },
            { prop: 'animation', example: 'fadeIn 1s ease-in', doc: 'CSS animation' },
            
            // Visibility
            { prop: 'visibility', example: 'visible', doc: 'Visibility (visible, hidden)' },
            { prop: 'cursor', example: 'pointer', doc: 'Cursor type' },
            { prop: 'pointer-events', example: 'none', doc: 'Pointer events (auto, none)' },
        ];

        cssProps.forEach(({ prop, example, doc }) => {
            acceptor({
                label: prop,
                kind: 10, // Property
                detail: doc,
                insertText: `${prop}: ${example}; `,
                insertTextFormat: 1,
                documentation: `${doc}\nExample: ${prop}: ${example};`
            });
        });

        // Add common color values
        const colors = [
            { name: 'transparent', value: 'transparent' },
            { name: 'white', value: '#ffffff' },
            { name: 'black', value: '#000000' },
            { name: 'red', value: '#ff0000' },
            { name: 'blue', value: '#0000ff' },
            { name: 'green', value: '#00ff00' },
            { name: 'yellow', value: '#ffff00' },
            { name: 'gray', value: '#808080' },
        ];

        colors.forEach(({ name, value }) => {
            acceptor({
                label: name,
                kind: 12, // Value
                detail: `Color: ${value}`,
                insertText: value,
                insertTextFormat: 1,
                documentation: `Predefined color: ${name}`
            });
        });
    }

    private completeQuote(acceptor: CompletionAcceptor): void {
        acceptor({
            label: '> Quote',
            kind: 15,
            detail: 'Block quote',
            insertText: '> $0',
            insertTextFormat: 2,
            documentation: 'Insert a block quote'
        });
    }
}
