grammar SlideDeckML

entry SlideDeck:
    (slides+=Slide (SLIDE_SEPARATOR slides+=Slide)* SLIDE_SEPARATOR?)?;

Template:
    index=INT
    block=Block;

Slide:
    blocks+=Block+;

Block:
    (lines+=Line | media+=Media)+;

Line:
    PointedList | OrderedList | Quote | Heading | Paragraph;

TextSpan:
    parts+=Inline+;

Inline:
      Bold
    | Italic
    | Underline
    | PlainText;

PlainText:
    text=TEXT;

Heading:
    level=HEADING_MARKER text=INLINE_TEXT;

PointedList:
    items+=PointedListItem+;

PointedListItem:
    POINTED_LIST_ITEM text=INLINE_TEXT;

OrderedList:
    items+=OrderedListItem+;

OrderedListItem:
    ORDERED_LIST_ITEM text=INLINE_TEXT;

Quote:
    QUOTE_MARKER text=INLINE_TEXT;

Paragraph:
    text=INLINE_TEXT;

CharStyle:
    Bold | Italic | Underline;

Bold:
    '**' content=BOLD_CONTENT '**';
Italic:
    '*' content=ITALIC_CONTENT '*';
Underline:
    '__' content=UNDERLINE_CONTENT '__';


Media:
    ImageBlock | VideoBlock;

ImageBlock:
    '![Image]' '(' url=URL ')';

VideoBlock:
    '![Video]' '(' url=URL ')';


terminal HEADING_MARKER: '###' | '##' | '#';
terminal POINTED_LIST_ITEM: /[\*\-\+][\t ]+/;
terminal ORDERED_LIST_ITEM: /[0-9]+\.[\t ]+/;
terminal QUOTE_MARKER: />[\t ]+/;

terminal SLIDE_SEPARATOR: /===[\t ]*\r?\n/;
terminal TEMPLATE_SEPARATOR: /---[\t ]*\r?\n/;

terminal BOLD_CONTENT: /[^*\r\n]+/;
terminal ITALIC_CONTENT: /[^*\r\n]+/;
terminal UNDERLINE_CONTENT: /[^_\r\n]+/;
terminal INLINE_TEXT: /[^\r\n]+/;
terminal URL: /[^\r\n\)]+/;
terminal TEXT: /[^_\*\r\n]+/;



terminal INT: /[0-9]+/;

hidden terminal WS: /[\t ]+/;
hidden terminal NL: /\r?\n/;
