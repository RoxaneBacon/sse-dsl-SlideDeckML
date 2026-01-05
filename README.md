# SlideDeckML

A Domain-Specific Language (DSL) for creating reveal.js presentations using simplified markdown syntax, built with Langium.

## Features

- **Simple Syntax**: Write slides with familiar markdown-style syntax
- **Headings**: Support for `#`, `##`, and `###` headings
- **Slide Separation**: Use `===` to separate slides
- **reveal.js Output**: Generates beautiful HTML presentations powered by reveal.js

## Installation

```bash
npm install
npm run langium:generate
npm run build
```

## Usage

### Development Mode (Live Preview)

```bash
npm run dev examples/demo.sdml
```

Opens a browser with split-screen editor and live preview. Changes are compiled automatically.

```bash
npm run dev examples/demo.sdml -- --port 3001  # Custom port
npm run dev examples/demo.sdml -- --no-open    # Don't open browser
npm run dev                                     # Start without file
```

See [DEV_MODE.md](DEV_MODE.md) for details.

### Production Mode (Compile to HTML)

#### 1. Write your presentation

Create a `.sdml` file:

```
# Welcome to My Presentation
This is the first slide

===

## Second Slide
Some content here

===

### Final Slide
Thank you!
```

#### 2. Compile to HTML

```bash
npm run compile examples/demo.sdml -o output.html
```

#### 3. Open in browser

```bash
open output.html
```

## Syntax Reference

### Headings

```
# Level 1 Heading
## Level 2 Heading
### Level 3 Heading
```

### Paragraphs

Any line that doesn't start with `#` is treated as a paragraph:

```
This is a paragraph
This is another paragraph
```

### Slide Separator

Use `===` on its own line to create a new slide:

```
First slide content
===
Second slide content
```

## Project Structure

```
sse-dsl-SlideDeckML/
├── src/
│   ├── language/
│   │   ├── slide-deck.langium      # Grammar definition
│   │   └── slide-deck-module.ts    # Langium module setup
│   ├── generator/
│   │   └── html-generator.ts       # HTML generation logic
│   └── cli/
│       └── main.ts                 # CLI entry point
├── examples/
│   └── demo.sdml                   # Example presentation
├── package.json
└── langium-config.json
```

## Development

### Generate Langium parser

```bash
npm run langium:generate
```

### Build TypeScript

```bash
npm run build
```

### Watch mode

```bash
npm run langium:watch    # Watch grammar changes
npm run watch            # Watch TypeScript changes
```

## License

MIT
