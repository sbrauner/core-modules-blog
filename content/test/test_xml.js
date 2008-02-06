core.content.xml();
s = "<thingy attr='name'>hi</thingy>";

f = xml._xmlTokenizer(s);
while(true){
    tok = f();
    if (tok == -1) break;
    //print(tok);
}

x = xml.fromString(s);

assert(x.thingy == "hi");
assert(x.thingy._props.attr == "name");

s = "<recursetest attr='noobs' hello=\"goodbye\"><hello>test</hello></recursetest>";

x = xml.fromString(s);

assert(x.recursetest._props.attr == "noobs");
assert(x.recursetest._props.hello == 'goodbye');
assert(x.recursetest.hello == "test");

s = "<emptytest/>"

x = xml.fromString(s);

assert(x.emptytest == null);

s = "<multtest><elem1>hi</elem1><elem2>yo</elem2></multtest>";

x = xml.fromString(s);

assert(x.multtest.elem1 == "hi");
assert(x.multtest.elem2 == 'yo');

s = "<listtest><elem>hi</elem><elem>hi2</elem></listtest>";

x = xml.fromString(s);

assert(x.listtest.elem[0] == "hi");
assert(x.listtest.elem[1] == "hi2");

s = "<nulllisttest><elem/><elem>hi</elem></nulllisttest>";
x = xml.fromString(s);

assert(x.nulllisttest.elem[0] == null);
assert(x.nulllisttest.elem[1] == "hi");

function strip(s){
    return s.replace(/[ \n\t]/g, '');
}

foo = { _name : "C" , v : "V" };
x = { B : [ foo , foo ] };
s = xml.toString( "A"  , x );
s = strip( s );
assert( s == "<A><B><C><v>V</v></C><C><v>V</v></C></B></A>" );

x = [ { a : "d1" } , { b : "yo" } ]
s = strip(xml.toString("listtest", x));
print( s );
//assert(s == "<listtest><a>di</a><a>yo</a></listtest>");


