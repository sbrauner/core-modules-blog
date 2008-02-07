core.content.xml();
s = "<thingy attr='name'>hi</thingy>";

function dump(s){
    f = xml._xmlTokenizer(s);
    while(true){
        tok = f();
        if (tok == -1) break;
        print(tok);
    }
}

x = xml.fromString(s);
assert(x._name == "thingy");
assert(x._props.attr == "name");
assert(x.child == "hi");

s = "<recursetest attr='noobs' hello=\"goodbye\"><hello>test</hello></recursetest>";

x = xml.fromString(s);

assert(x._name == "recursetest");
assert(x._props.attr == "noobs");
assert(x._props.hello == 'goodbye');
assert(x.child[0]._name == "hello");
assert(x.child[0]._props == null);
assert(x.child[0].child == "test");

s = "<emptytest/>"

x = xml.fromString(s);

assert(x._name == "emptytest");
assert(x.child == null);

s = "<multtest><elem1>hi</elem1><elem2>yo</elem2></multtest>";

x = xml.fromString(s);

print(tojson(x));
assert(x._name == "multtest");
assert(x.child[0]._name == "elem1");
assert(x.child[0].child == "hi");
assert(x.child[1]._name == "elem2");
assert(x.child[1].child == "yo");

s = "<listtest><elem>hi</elem><elem>hi2</elem></listtest>";

x = xml.fromString(s);

assert(x._name == "listtest");
assert(x._props == null);
assert(x.child[0]._name == "elem");
assert(x.child[0].child == "hi");
assert(x.child[1]._name == "elem");
assert(x.child[1].child == "hi2");

s = "<nulllisttest><elem/><elem>hi</elem></nulllisttest>";
x = xml.fromString(s);


assert(x._name == "nulllisttest");
assert(x.child[0]._name == "elem");
assert(x.child[0].child == null);
assert(x.child[1].child == "hi");
assert(x.child[1]._name == "elem");

s = "<?xml version=\"1.0\" ?><methodResponse><params><param><value><struct><member><name>difference</name><value><i4>3</i4></value></member><member><name>sum</name><value><i4>9</i4></value></member></struct></value></param></params></methodResponse>";
x = xml.fromString(s);

assert(x.child[0].child[0].child[0].child[0].child[0]._name == "member");
assert(x.child[0].child[0].child[0].child[0].child[0].child[0]._name == "name");
assert(x.child[0].child[0].child[0].child[0].child[0].child[0].child == "difference");

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


