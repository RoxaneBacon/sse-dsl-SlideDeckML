import { ComponentDefinition, ComponentUsage, Block } from "../language/generated/ast";

/**
 * Processes and manages reusable components
 */
export class ComponentProcessor {
    private components: Map<string, { params: string[], body: any }> = new Map();

    /**
     * Register all component definitions from the presentation
     * @param componentDefs Array of component definitions
     */
    public registerComponents(componentDefs: ComponentDefinition[]): void {
        this.components.clear();
        for (const component of componentDefs) {
            // Parse the COMPONENT_DECL to extract name and params
            const declMatch = component.$cstNode?.text.match(/@component\s+([a-zA-Z_][a-zA-Z0-9_\-]*)(?:\s+([a-zA-Z_][a-zA-Z0-9_\-\s]*))?/);
            if (declMatch) {
                const name = declMatch[1];
                const paramsStr = declMatch[2]?.trim() || '';
                const params = paramsStr ? paramsStr.split(/\s+/) : [];
                
                this.components.set(name, {
                    params,
                    body: component.body
                });
            }
        }
    }

    /**
     * Check if a component is defined
     * @param name Component name
     * @returns True if component exists
     */
    public hasComponent(name: string): boolean {
        return this.components.has(name);
    }

    /**
     * Instantiate a component with given parameters
     * @param usage Component usage node
     * @returns Blocks with parameter substitution applied
     */
    public instantiateComponent(usage: ComponentUsage): Block[] {
        // Parse the COMPONENT_USAGE terminal
        const usageText = usage.usage;
        const match = usageText.match(/@use\s+([a-zA-Z_][a-zA-Z0-9_\-]*)/);
        if (!match) {
            console.warn('Could not parse component usage');
            return [];
        }
        
        const componentName = match[1];
        const componentData = this.components.get(componentName);
        if (!componentData) {
            console.warn(`Component '${componentName}' not found`);
            return [];
        }

        // Build parameter map by parsing key="value" pairs
        const paramMap = new Map<string, string>();
        const paramRegex = /([a-zA-Z_][a-zA-Z0-9_\-]*)="([^"]*)"/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(usageText)) !== null) {
            paramMap.set(paramMatch[1], paramMatch[2]);
        }

        // Clone and substitute parameters in component body
        const instantiatedBlocks = this.substituteParameters(
            componentData.body.blocks,
            paramMap
        );

        return instantiatedBlocks;
    }

    /**
     * Recursively substitute parameters in blocks
     * @param blocks Original blocks from component definition
     * @param paramMap Map of parameter names to values
     * @returns Cloned blocks with substituted parameters
     */
    private substituteParameters(blocks: Block[], paramMap: Map<string, string>): Block[] {
        // Instead of deep cloning, we'll generate the HTML directly from the blocks
        // and let the line content handler process them
        // For now, we return the blocks as-is since the substitution will happen during HTML generation
        return blocks.map(block => this.cloneAndSubstituteBlock(block, paramMap));
    }

    /**
     * Clone a block and substitute parameters in its text content
     * @param block Original block
     * @param paramMap Map of parameters to values
     * @returns Cloned block with substitutions
     */
    private cloneAndSubstituteBlock(block: Block, paramMap: Map<string, string>): Block {
        const clonedBlock = {
            $type: 'Block',
            lines: block.lines.map(line => this.cloneAndSubstituteLine(line, paramMap))
        } as Block;
        return clonedBlock;
    }

    /**
     * Clone a line and substitute parameters
     * @param line Original line
     * @param paramMap Map of parameters to values
     * @returns Cloned line with substitutions
     */
    private cloneAndSubstituteLine(line: any, paramMap: Map<string, string>): any {
        // Create a shallow copy and substitute text properties
        const cloned = { ...line };
        
        // Recursively process nested elements
        if (cloned.elements) {
            cloned.elements = cloned.elements.map((el: any) => this.cloneAndSubstituteLine(el, paramMap));
        }
        if (cloned.items) {
            cloned.items = cloned.items.map((item: any) => ({ 
                ...item, 
                text: this.substituteText(item.text, paramMap)
            }));
        }
        
        // Substitute in text fields
        if (cloned.text) {
            cloned.text = this.substituteText(cloned.text, paramMap);
        }
        if (cloned.content) {
            cloned.content = this.substituteText(cloned.content, paramMap);
        }
        if (cloned.style) {
            cloned.style = this.substituteText(cloned.style, paramMap);
        }
        
        return cloned;
    }

    /**
     * Substitute ${param} placeholders in text
     * @param text Original text
     * @param paramMap Map of parameters to values
     * @returns Text with substitutions
     */
    private substituteText(text: string | undefined, paramMap: Map<string, string>): string | undefined {
        if (!text) return text;
        
        let result = text;
        for (const [name, value] of paramMap.entries()) {
            const pattern = new RegExp(`\\$\\{${name}\\}`, 'g');
            result = result.replace(pattern, value);
        }
        return result;
    }

    /**
     * Clear all registered components
     */
    public clear(): void {
        this.components.clear();
    }

    /**
     * Get all registered component names
     * @returns Array of component names
     */
    public getComponentNames(): string[] {
        return Array.from(this.components.keys());
    }
}
