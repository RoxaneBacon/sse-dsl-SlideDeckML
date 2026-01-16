import { Presentation, Slide, Template, isQuiz } from "../language/generated/ast";

/**
 * Detects interactive elements (Quiz) in presentations
 */
export class InteractiveElementDetector {
    /**
     * Check if a presentation contains any Quiz elements
     * @param presentation The presentation AST to check
     * @returns true if Quiz detected
     */
    public static hasInteractiveElements(presentation: Presentation): boolean {
        // Check template if it exists
        if (presentation.template && this.checkSlideOrTemplate(presentation.template)) {
            return true;
        }

        // Check all slides
        for (const slide of presentation.slides) {
            if (this.checkSlideOrTemplate(slide)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a slide or template contains Quiz elements
     * @param slideOrTemplate The slide or template to check
     * @returns true if Quiz found
     */
    private static checkSlideOrTemplate(slideOrTemplate: Slide | Template): boolean {
        for (const block of slideOrTemplate.blocks) {
            if (isQuiz(block)) {
                return true;
            }
        }
        return false;
    }
}
