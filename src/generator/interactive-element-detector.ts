import { Presentation, Slide, isQuiz } from "../language/generated/ast";

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
        // Check all slides
        const slides = presentation.slides?.slides || [];
        for (const slide of slides) {
            if (this.checkSlide(slide)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a slide contains Quiz elements
     * @param slide The slide to check
     * @returns true if Quiz found
     */
    private static checkSlide(slide: Slide): boolean {
        for (const block of slide.blocks) {
            if (isQuiz(block)) {
                return true;
            }
        }
        return false;
    }
}
