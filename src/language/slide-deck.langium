grammar SlideDeckML

entry Presentation:
    (metadata=Metadata)?
    (TEMPLATE_SEPARATOR? template=Template TEMPLATE_SEPARATOR?)?
    (SLIDE_SEPARATOR? slides+=Slide (SLIDE_SEPARATOR slides+=Slide)* SLIDE_SEPARATOR?)?;

Metadata:
    '{' 'author' ':' author=STRING 'title' ':' title=STRING ('theme' ':' theme=STRING)? ('logo' ':' logo=STRING)? ('css' ':' css=STRING)?  '}';

Slide:
    blocks+=Block+;

Template:
    blocks+=Block+;

Block:
    lines+=LineContent+;

LineContent:
    StyledElement | Header | UnorderedList | OrderedList | Quote | Media | Paragraph | CodeBlock | SyncFragments;

CodeBlock:
    content=CODE_BLOCK;

SyncFragments:
    (opening=SYNC_DELIMITER_KEEP | opening=SYNC_DELIMITER) fragments+=FragmentItem (FRAGMENT_SEPARATOR fragments+=FragmentItem)* (closing=SYNC_DELIMITER_KEEP | closing=SYNC_DELIMITER);

FragmentItem:
    text=PARAGRAPH_TEXT | media=MEDIA_LINE;

StyledElement:
    STYLE_DELIMITER style=STYLE_ATTRS elements+=(Header | UnorderedList | OrderedList | Quote | Media | Paragraph | CodeBlock | SyncFragments)+ STYLE_DELIMITER;

UnorderedList:
    items+=UnorderedListItem+;

OrderedList:
    items+=OrderedListItem+;

Header:
    level=HEADER_LEVEL text=PARAGRAPH_TEXT;

UnorderedListItem:
    marker=LIST_MARKER text=PARAGRAPH_TEXT;

OrderedListItem:
    number=INT '.' text=PARAGRAPH_TEXT;

Paragraph:
    text=PARAGRAPH_TEXT;

Quote:
    marker='>' text=PARAGRAPH_TEXT;

Media:
    content=MEDIA_LINE;

terminal CODE_BLOCK returns string:
    /```[a-zA-Z0-9_\-]*(?:\s*\[(?:(?:highlight:\s*(?:block|function|class|line-by-line|all|none))|(?:lines:\s*["'][^"']+["'])|(?:start:\s*\d+)|\s)+\])?[\r\n]([\s\S]*?)```/;

terminal SYNC_DELIMITER_KEEP: /:::\[sync-fragments\s+keep\]/;
terminal SYNC_DELIMITER: /:::\[sync-fragments\]/;

terminal FRAGMENT_SEPARATOR: /\[\-\-\-\]/;

terminal MEDIA_LINE returns string:
    /!\[[^\]]+\]\([^\)]+\)/;

terminal STYLE_ATTRS returns string:
    /\{[^\}\r\n]+\}/;

terminal STYLE_DELIMITER: /:::/;

terminal SLIDE_SEPARATOR: /===[\t ]*\r?\n/;
terminal TEMPLATE_SEPARATOR: /---[	 ]*\r?\n/;
terminal HEADER_LEVEL: /###|##|#/;

terminal LIST_MARKER: /[\-\*\+]/;

terminal PARAGRAPH_TEXT returns string:
    /(?!(###|##|#)[ \t]+)(?![\-\*\+][ \t]+)(?![0-9]+\.[ \t]+)(?!>)(?!\!\[)(?!:::)(?!```)(?!===)(?!---)(?!\[\-\-\-\])(?![\s]*\{)(?![\s]*\})(?![\s]*author)(?![\s]*title)(?![\s]*css)(?![\s]*logo)(?![\s]*theme)(?![\s]*:)(?!")(?!\.)[^\r\n]+/;

terminal STRING returns string:
    /"(?:\\.|[^"\\])*"/;

terminal INT returns number:
    /[0-9]+/;

hidden terminal NEWLINE:
    /\r?\n/;

hidden terminal WS:
    /[ \t]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
