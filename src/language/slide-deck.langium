grammar SlideDeckML

entry SlideDeck:
    (slides+=Slide (SLIDE_SEPARATOR slides+=Slide)* SLIDE_SEPARATOR?)?;

Slide:
    content+=Content+;

Content:
    Heading | Paragraph;

Heading:
    level=HEADING_MARKER text=TEXT_LINE;

Paragraph:
    text=TEXT_LINE;

terminal HEADING_MARKER: '#' '#'? '#'?;
terminal SLIDE_SEPARATOR: /===[\t ]*[\r\n]+/;
terminal TEXT_LINE: /[^\r\n#][^\r\n]*[\r\n]+/;

hidden terminal WS: /[\t ]+/;
hidden terminal EMPTY_LINE: /[\r\n]/;
