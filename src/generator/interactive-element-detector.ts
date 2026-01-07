import { Presentation, Slide, Template, isQuiz, isLivePoll } from "../language/generated/ast";

/**
 * Detects interactive elements (Quiz/Poll) in presentations
 */
export class InteractiveElementDetector {
    /**
     * Check if a presentation contains any Quiz or LivePoll elements
     * @param presentation The presentation AST to check
     * @returns true if Quiz or Poll detected
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
     * Check if a slide or template contains Quiz or LivePoll elements
     * @param slideOrTemplate The slide or template to check
     * @returns true if Quiz or Poll found
     */
    private static checkSlideOrTemplate(slideOrTemplate: Slide | Template): boolean {
        for (const block of slideOrTemplate.blocks) {
            if (isQuiz(block) || isLivePoll(block)) {
                return true;
            }
        }
        return false;
    }
}
