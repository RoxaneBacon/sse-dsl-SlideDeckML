const fs = require('fs');
const path = require('path');

// Read the configuration file
const configPath = path.join(__dirname, '..', 'textmate-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Helper function to convert pattern objects to TextMate format
function convertPattern(pattern) {
    if (pattern.pattern) {
        const result = {
            name: pattern.scope,
            match: pattern.pattern
        };
        if (pattern.captures) {
            result.captures = {};
            for (const [key, value] of Object.entries(pattern.captures)) {
                result.captures[key] = { name: value };
            }
        }
        return result;
    }
    return null;
}

// Helper function to convert block patterns
function convertBlock(block) {
    const result = {
        name: block.scope,
        begin: block.begin,
        end: block.end
    };
    
    if (block.beginCaptures) {
        result.beginCaptures = {};
        for (const [key, value] of Object.entries(block.beginCaptures)) {
            result.beginCaptures[key] = { name: value };
        }
    }
    
    if (block.endCaptures) {
        result.endCaptures = {};
        for (const [key, value] of Object.entries(block.endCaptures)) {
            result.endCaptures[key] = { name: value };
        }
    }
    
    if (block.contentScope) {
        result.patterns = [{ name: block.contentScope, match: ".*" }];
    }
    
    if (block.patterns) {
        if (!result.patterns) result.patterns = [];
        for (const pattern of block.patterns) {
            const converted = convertPattern(pattern);
            if (converted) result.patterns.push(converted);
        }
    }
    
    return result;
}

// Build the TextMate grammar
const grammar = {
    name: config.name,
    scopeName: config.scopeName,
    fileTypes: config.fileTypes,
    patterns: [
        { include: "#comments" }
    ],
    repository: {}
};

// Add comments to repository
if (config.comments) {
    grammar.repository.comments = {
        patterns: config.comments.map(convertBlock)
    };
}

// Add patterns
const patternIncludes = [];

// Process blocks (code blocks, style blocks, metadata, etc.)
if (config.blocks) {
    for (const block of config.blocks) {
        const key = block.name.toLowerCase().replace(/\s+/g, '-');
        grammar.repository[key] = {
            patterns: [convertBlock(block)]
        };
        patternIncludes.push({ include: `#${key}` });
    }
}

// Add inline patterns
if (config.inlinePatterns) {
    grammar.repository['inline-formatting'] = {
        patterns: config.inlinePatterns.map(convertPattern)
    };
}

// Process regular patterns (headers, lists, quotes, media)
const regularPatterns = {};
for (const pattern of config.patterns) {
    const key = pattern.name.toLowerCase().replace(/\s+/g, '-');
    
    if (!regularPatterns[key.split('-')[0] + 's']) {
        regularPatterns[key.split('-')[0] + 's'] = [];
    }
    
    const converted = convertPattern(pattern);
    
    // Add inline formatting support for content captures
    if (converted.captures && converted.captures['2']) {
        converted.captures['2'].patterns = [{ include: "#inline-formatting" }];
    }
    
    regularPatterns[key.split('-')[0] + 's'].push(converted);
}

// Add to repository
for (const [key, patterns] of Object.entries(regularPatterns)) {
    grammar.repository[key] = { patterns };
    patternIncludes.push({ include: `#${key}` });
}

// Add paragraph pattern
grammar.repository.paragraph = {
    patterns: [
        {
            name: "meta.paragraph.slidedeckml",
            match: "^[^#\\-*+>!:{=\\s].*$",
            captures: {
                "0": {
                    patterns: [{ include: "#inline-formatting" }]
                }
            }
        }
    ]
};
patternIncludes.push({ include: "#paragraph" });

// Add string pattern
grammar.repository.string = {
    patterns: [
        {
            name: "string.quoted.double.slidedeckml",
            begin: "\"",
            beginCaptures: {
                "0": { name: "punctuation.definition.string.begin.slidedeckml" }
            },
            end: "\"",
            endCaptures: {
                "0": { name: "punctuation.definition.string.end.slidedeckml" }
            },
            patterns: [
                {
                    name: "constant.character.escape.slidedeckml",
                    match: "\\\\."
                }
            ]
        }
    ]
};

// Add all includes to main patterns
grammar.patterns.push(...patternIncludes);

// Write the output file
const outputPath = path.join(__dirname, '..', 'syntaxes', 'slidedeckml.tmLanguage.json');
fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2), 'utf-8');

console.log('✅ TextMate grammar generated successfully at:', outputPath);
