core.content.xml();

s = "\n  <  newlinetest \n  > \t <  \n elem\tattr\n= 'hi'\t>  \ncdata     \n \t< \n/\telem>\t<\nelem\n\t/><elem /\n> </newlinetest>";
newlinetest = s;
x = xml.fromString(s);

function stripdup(s){
    return s.replace(/[ \n\t]+/g, ' ');
}

function strip(s){
    s = s.replace(/"/g, "'");
    return s.replace(/[ \n\t]/g, '');
}

assert(strip(xml.toString(null, xml.fromString(newlinetest))) == strip(newlinetest));

foo = { _name : "C" , v : "V" };
x = { B : [ foo , foo ] };
s = xml.toString( "A"  , x );
s = strip( s );
assert( s == "<A><B><C><v>V</v></C><C><v>V</v></C></B></A>" );

x = [ { a : "d1" } , { b : "yo" } ]
s = strip(xml.toString("listtest", x));

//print( s );
//assert(s == "<listtest><a>di</a><a>yo</a></listtest>");




