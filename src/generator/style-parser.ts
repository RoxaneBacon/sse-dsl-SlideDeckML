/**
 * Style parser for handling CSS style attributes
 */
export class StyleParser {
    /**
     * Parse style attributes from style block
     * @param styleBlock Style attributes like {color: 'red', top: 200} or {calque: 10, horizontal-margin: 200}
     * @returns HTML style attribute string
     */
    public parseStyle(styleBlock: string): string {
        if (!styleBlock) return '';
        
        try {
            // Remove outer braces
            const content = styleBlock.replace(/^\{|\}$/g, '').trim();
            if (!content) return '';
            
            // Parse key-value pairs (support both semicolon and comma separators)
            const styles: string[] = [];
            let hasAbsoluteKeywords = false;
            
            // Split by semicolon or comma, but not inside parentheses
            const pairs = this.smartSplit(content).map(pair => pair.trim()).filter(pair => pair.length > 0);
            
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

    /**
     * Split CSS properties by semicolon or comma, but not inside parentheses
     * This handles cases like linear-gradient(135deg, #667eea 0%, #764ba2 100%)
     * and box-shadow with multiple shadows: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
     * 
     * Strategy: Split only on semicolons, or on commas that are followed by a property name (word followed by colon)
     * @param content CSS properties string
     * @returns Array of property pairs
     */
    private smartSplit(content: string): string[] {
        const result: string[] = [];
        let current = '';
        let depth = 0;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (char === '(') {
                depth++;
                current += char;
            } else if (char === ')') {
                depth--;
                current += char;
            } else if (char === ';' && depth === 0) {
                // Always split on semicolon if we're not inside parentheses
                if (current.trim()) {
                    result.push(current.trim());
                }
                current = '';
            } else if (char === ',' && depth === 0) {
                // Only split on comma if the next part looks like a property (has a colon for key:value)
                // Look ahead to see if this comma separates properties or is part of a value
                const remaining = content.substring(i + 1).trim();
                // Check if remaining starts with word characters followed by colon
                if (/^[a-zA-Z-]+\s*:/.test(remaining)) {
                    // This comma separates properties
                    if (current.trim()) {
                        result.push(current.trim());
                    }
                    current = '';
                } else {
                    // This comma is part of the value (like in box-shadow or transform)
                    current += char;
                }
            } else {
                current += char;
            }
        }
        
        // Add the last property
        if (current.trim()) {
            result.push(current.trim());
        }
        
        return result;
    }
}
