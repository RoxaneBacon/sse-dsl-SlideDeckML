import { AstNode } from 'langium';

interface Heading extends AstNode {
    $type: 'Heading';
    level: string;
    text: string;
}

interface Paragraph extends AstNode {
    $type: 'Paragraph';
    text: string;
}

interface Slide extends AstNode {
    $type: 'Slide';
    content: Array<Heading | Paragraph>;
}

interface SlideDeck extends AstNode {
    $type: 'SlideDeck';
    slides: Slide[];
}

export function generateHTML(slideDeck: SlideDeck): string {
    const slidesHTML = slideDeck.slides
        .map(slide => generateSlide(slide))
        .join('\n');

    return getHTMLTemplate(slidesHTML);
}

function generateSlide(slide: Slide): string {
    const contentHTML = slide.content
        .map(item => {
            if (item.$type === 'Heading') {
                return generateHeading(item as Heading);
            } else if (item.$type === 'Paragraph') {
                return generateParagraph(item as Paragraph);
            }
            return '';
        })
        .join('\n');

    return `        <section>\n${contentHTML}\n        </section>`;
}

function generateHeading(heading: Heading): string {
    const level = heading.level.length; // # = 1, ## = 2, ### = 3
    const text = escapeHtml(heading.text.trim());
    return `            <h${level}>${text}</h${level}>`;
}

function generateParagraph(paragraph: Paragraph): string {
    const text = escapeHtml(paragraph.text.trim());
    return `            <p>${text}</p>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getHTMLTemplate(slidesContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SlideDeckML Presentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/black.css">
</head>
<body>
    <div class="reveal">
        <div class="slides">
${slidesContent}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: 'slide',
            backgroundTransition: 'fade'
        });
    </script>
</body>
</html>`;
}
