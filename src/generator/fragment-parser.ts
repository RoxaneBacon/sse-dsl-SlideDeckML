/**
 * Fragment parser for handling reveal.js fragment animations
 */
export class FragmentParser {
    /**
     * Parse fragment attributes from fragment block
     * @param fragmentBlock Fragment attributes like {.fragment .fade-up} or {.fragment fragment-index=2}
     * @returns Object with class string and data attributes
     */
    public parseFragment(fragmentBlock: string): { class: string; dataAttrs: string } {
        if (!fragmentBlock) return { class: '', dataAttrs: '' };
        
        try {
            // Remove outer braces
            const content = fragmentBlock.replace(/^\{|\}$/g, '').trim();
            if (!content) return { class: '', dataAttrs: '' };
            
            const classes: string[] = [];
            let fragmentIndex: number | undefined;
            
            // Split by whitespace to get individual parts
            const parts = content.split(/\s+/);
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                
                if (part.startsWith('.')) {
                    // It's a class, remove the dot and add to classes array
                    classes.push(part.substring(1));
                } else if (part === 'fragment-index') {
                    // Next part should be = and then a number
                    if (i + 2 < parts.length && parts[i + 1] === '=') {
                        fragmentIndex = parseInt(parts[i + 2]);
                        i += 2; // Skip the = and number
                    }
                } else if (part.startsWith('fragment-index=')) {
                    // Handle fragment-index=2 format (no spaces)
                    const match = part.match(/fragment-index=(\d+)/);
                    if (match) {
                        fragmentIndex = parseInt(match[1]);
                    }
                }
            }
            
            // Build the result
            const classStr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
            const dataStr = fragmentIndex !== undefined ? ` data-fragment-index="${fragmentIndex}"` : '';
            
            return {
                class: classStr,
                dataAttrs: dataStr
            };
        } catch (e) {
            return { class: '', dataAttrs: '' };
        }
    }
}
