import { Metadata } from "../language/generated/ast";

export class TemplateGenerator {
    private title: string = 'SlideDeckML Presentation'
    private author: string = 'Unknown Author'

    public setMetadata(metadata: Metadata): void {
        // Access author and title directly from the metadata object
        this.author = metadata.author.replace(/^"|"$/g, '');
        this.title = metadata.title.replace(/^"|"$/g, '');
    }
    public getHTMLTemplate(slidesContent: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="${this.author}">
    <meta name="title" content="${this.title}">
    <title>${this.title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.4/dist/theme/white.css">
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
}

