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
