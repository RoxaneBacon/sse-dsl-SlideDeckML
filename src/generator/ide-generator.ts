import { Editor, Output } from "../language/generated/ast";
import { TextProcessor } from "./element-generator";

/**
 * Generator for integrated development environment components
 * Handles Monaco Editor and Pyodide integration for live coding
 */
export class IdeGenerator {
    private editorCounter = 0;
    private textProcessor = new TextProcessor();

    /**
     * Generate HTML for an interactive code editor
     * @param editor The editor AST node
     * @param style Optional style attributes
     * @returns HTML string for the Monaco editor
     */
    public generateEditor(editor: Editor, style: string = ''): string {
        const editorNum = this.editorCounter++;
        const editorId = `editor-${editorNum}`;
        const language = editor.language;

        // Get output ID from reference (try ref first, then $refText)
        let outputId = '';
        if (editor.output) {
            if (editor.output.ref) {
                outputId = this.sanitizeOutputId(editor.output.ref.id);
            } else if (editor.output.$refText) {
                outputId = this.sanitizeOutputId(editor.output.$refText);
            }
        }

        // Extract placeholder code from CODE_BLOCK
        let initialCode = '';
        if (editor.placeholder) {
            initialCode = this.extractCodeFromBlock(editor.placeholder);
        }

        return `            <div class="ide-editor-container"${style}>
                <button class="run-button" data-editor-id="${editorId}">▶ Run</button>
                <div id="${editorId}"
                     class="monaco-editor-wrapper"
                     data-language="${language}"
                     data-output-id="${outputId}"
                     data-initial-code="${this.escapeForAttribute(initialCode)}"
                     style="width: 500px; height: 350px; border: 1px solid #ccc;"></div>
            </div>`;
    }

    /**
     * Generate HTML for code output display
     * @param output The output AST node
     * @param style Optional style attributes
     * @returns HTML string for the output container
     */
    public generateOutput(output: Output, style: string = ''): string {
        const outputId = this.sanitizeOutputId(output.id);

        return `            <div class="ide-output-container"${style}>
                <div id="${outputId}" class="output-content" style="width: 500px; box-sizing: border-box; background: #1e1e1e; color: #d4d4d4; padding: 12px; margin: 0; min-height: 100px; max-height: 350px; overflow-y: auto; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap;"></div>
            </div>`;
    }


    /**
     * Sanitize output ID by removing quotes
     */
    private sanitizeOutputId(id: string): string {
        return id.replace(/"/g, '');
    }

    /**
     * Extract code content from a CODE_BLOCK
     */
    private extractCodeFromBlock(codeBlock: string): string {
        const match = codeBlock.match(/```([a-zA-Z0-9_\-]*)?(?:\s*\[([^\]]*)\])?\s*[\r\n]([\s\S]*?)```/);
        if (!match) return '';

        const code = match[3] || '';
        return code;
    }

    /**
     * Escape HTML for use in HTML attributes
     */
    private escapeForAttribute(text: string): string {
        return this.textProcessor.escapeHtml(text)
            .replace(/\n/g, '&#10;')
            .replace(/\r/g, '');
    }

    /**
     * Reset the editor counter
     */
    public resetCounter(): void {
        this.editorCounter = 0;
    }
}
