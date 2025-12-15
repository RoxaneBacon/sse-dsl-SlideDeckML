grammar SlideDeckML

entry Presentation:
    header=Header?
    slides+=Slide*;

Header:
    'header' '{'
        ('title' ':' title=STRING)?
        ('author' ':' author=STRING)?
    '}';

Slide:
    SLIDE_SEPARATOR
    (blocks+=Block (NL+ blocks+=Block)*)?;

Block:
    LineHeading | Media | LineParagraph;

LineHeading:
    level=HEADING_MARKER text=TEXT NL;

LineParagraph:
    text=TEXT NL;

Media:
    '![' alt=ALT ']' '(' url=STRING ')' NL;

terminal SLIDE_SEPARATOR: /===[\r\n]+/;
terminal HEADING_MARKER: /#{1,3}[ \t]+/;
terminal STRING: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/;
terminal NL: /\r?\n/;
terminal ALT: /[^\]]+/;
terminal TEXT: /[^\r\n]+/;

hidden terminal WS: /[ \t]+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\r\n]*/;
