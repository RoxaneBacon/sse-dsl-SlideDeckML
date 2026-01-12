/**
 * Fragment parser for handling reveal.js fragment animations
 */
export class FragmentParser {
    /**
     * Parse fragment attributes from fragment block
     * @param fragmentBlock Fragment attributes like {animate: "fade-up"} or {animate: "fade-in highlight-red" index: 2}
     * @returns Object with class string and data attributes
     */
    public parseFragment(fragmentBlock: string): { class: string; dataAttrs: string } {
        if (!fragmentBlock) return { class: '', dataAttrs: '' };
        
        try {
            // Remove outer braces
            const content = fragmentBlock.replace(/^\{|\}$/g, '').trim();
            if (!content) return { class: '', dataAttrs: '' };
            
            const classes: string[] = ['fragment']; // Always include base fragment class
            let fragmentIndex: number | undefined;
            
            // Parse animate: "effect1 effect2 ..."
            const animateMatch = content.match(/animate:\s*["']([^"']+)["']/);
            if (animateMatch) {
                const effects = animateMatch[1].trim().split(/\s+/);
                classes.push(...effects);
            }
            
            // Parse index: 2
            const indexMatch = content.match(/index:\s*(\d+)/);
            if (indexMatch) {
                fragmentIndex = parseInt(indexMatch[1]);
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
