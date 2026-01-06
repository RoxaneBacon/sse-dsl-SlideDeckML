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

### 1. Write your presentation

Create a `.sdml` file with your content:

```
# Welcome to My Presentation
This is the first slide

===

## Second Slide
Some content here
More content on the same slide

===

### Final Slide
Thank you!
```

### 2. Compile to HTML

**Manual compilation:**

```bash
npm run compile examples/demo.sdml -o output.html
```

Or using the CLI directly:

```bash
node out/cli/main.js compile examples/demo.sdml -o output.html
```

**Using build scripts (recommended):**

For PowerShell:
```powershell
# Compile a single file
.\build-and-compile.ps1 -InputPath examples/demo.sdml

# Compile all files in a directory
.\build-and-compile.ps1 -InputPath examples -OutputPath output

# Skip build step (if already built)
.\build-and-compile.ps1 -InputPath examples/demo.sdml -SkipBuild
```

For Bash:
```bash
# Compile a single file
./build-and-compile.sh examples/demo.sdml

# Compile all files in a directory
./build-and-compile.sh examples output

# Skip build step (if already built)
./build-and-compile.sh examples/demo.sdml "" --skip-build
```

The build scripts automatically:
- Run `npm run langium:generate` to regenerate the parser
- Run `npm run build` to compile TypeScript
- Compile the specified .sdml file(s) to HTML
- Show colored progress messages and error reporting

### 3. Open in browser

Simply open the generated HTML file in your web browser:

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
