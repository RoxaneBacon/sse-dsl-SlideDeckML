import { Utils } from './utils.js';

export class TextProcessor {
    static processInlineText(text: string): string {
        // First escape HTML entities
        let result = Utils.escapeHtml(text);
        // Process bold (**text**)
        result = result.replace(/\*\*([^*\r\n]+)\*\*/g, '<strong>$1</strong>');
        // Process italic (*text*)
        result = result.replace(/\*([^*\r\n]+)\*/g, '<em>$1</em>');
        // Process underline (__text__)
        result = result.replace(/__([^_\r\n]+)__/g, '<u>$1</u>');
        return result;
    }
}

