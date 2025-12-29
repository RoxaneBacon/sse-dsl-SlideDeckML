// Test regex patterns directly
const headerPattern = /(###|##|#)[ \t]+[^\r\n]+/;
const unorderedPattern = /[\-\*\+][ \t]+[^\r\n]+/;
const orderedPattern = /[0-9]+\.[ \t]+[^\r\n]+/;
const textPattern = /[^\r\n]+/;

const testLines = [
    "# Test",
    "- Item 1",
    "1. Numbered"
];

testLines.forEach(line => {
    console.log(`\nTesting: "${line}"`);
    console.log('  Header match:', headerPattern.test(line));
    console.log('  Unordered match:', unorderedPattern.test(line));
    console.log('  Ordered match:', orderedPattern.test(line));
    console.log('  Text match:', textPattern.test(line));
});
