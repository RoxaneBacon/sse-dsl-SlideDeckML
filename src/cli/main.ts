#!/usr/bin/env node

import { Command } from 'commander';
import { createSlideDeckMLServices } from '../language/slide-deck-module.js';
import { Presentation } from '../language/generated/ast.js';
import { generateHTML } from '../generator/html-generator.js';
import * as fs from 'fs';
import * as path from 'path';
import { NodeFileSystem } from 'langium/node';
import { URI } from 'langium';

const program = new Command();

program
    .name('slidedeckml')
    .description('Compile SlideDeckML files to reveal.js HTML presentations')
    .version('1.0.0');

program
    .command('compile')
    .description('Compile a SlideDeckML file to HTML')
    .argument('<input>', 'Input .sdml file')
    .option('-o, --output <file>', 'Output HTML file', 'presentation.html')
    .action(async (input: string, options: { output: string }) => {
        try {
            await compile(input, options.output);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

async function compile(inputFile: string, outputFile: string): Promise<void> {
    console.log(`Compiling ${inputFile}...`);

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }

    // Read input file
    const content = fs.readFileSync(inputFile, 'utf-8');

    // Create Langium services
    const services = createSlideDeckMLServices(NodeFileSystem).SlideDeckML;

    // Parse the document
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(
        content,
        URI.file(path.resolve(inputFile))
    );

    // Build the document (validate and link)
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    // Check for parse errors
    if (document.parseResult.lexerErrors.length > 0) {
        console.error('Lexer errors:');
        document.parseResult.lexerErrors.forEach(error => {
            console.error(`  Line ${error.line}: ${error.message}`);
        });
        throw new Error('Failed to parse document');
    }

    if (document.parseResult.parserErrors.length > 0) {
        console.error('Parser errors:');
        document.parseResult.parserErrors.forEach(error => {
            console.error(`  Line ${error.token.startLine}: ${error.message}`);
        });
        throw new Error('Failed to parse document');
    }

    // Extract AST
    const presentation = document.parseResult.value as Presentation;

    // Generate HTML
    const html = generateHTML(presentation);

    // Write output file
    fs.writeFileSync(outputFile, html, 'utf-8');

    console.log(`✓ Generated: ${outputFile}`);
    console.log(`  Open it in your browser to view the presentation!`);
}

program.parse();
