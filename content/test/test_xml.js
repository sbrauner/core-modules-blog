core.content.xml();
s = "<thingy attr='name'>hi</thingy>";

function dump(s){
    f = xml._xmlTokenizerchar(s);
    while(true){
        tok = f();
        if (tok == -1) break;
        print(tok);
    }
}

x = xml.fromString(s);
assert(x._name == "thingy");
assert(x._props.attr == "name");
assert(x["$"] == "hi");

s = "<recursetest attr='noobs' hello=\"goodbye\"><hello>test</hello></recursetest>";

x = xml.fromString(s);

assert(x._name == "recursetest");
assert(x._props.attr == "noobs");
assert(x._props.hello == 'goodbye');
assert(x["$"][0]._name == "hello");
assert(x["$"][0]._props == null);
assert(x["$"][0]["$"] == "test");

s = "<emptytest/>"

x = xml.fromString(s);

assert(x._name == "emptytest");
assert(x["$"] == null);

s = "<multtest><elem1>hi</elem1><elem2>yo</elem2></multtest>";

x = xml.fromString(s);

assert(x._name == "multtest");
assert(x["$"][0]._name == "elem1");
assert(x["$"][0]["$"] == "hi");
assert(x["$"][1]._name == "elem2");
assert(x["$"][1]["$"] == "yo");

s = "<listtest><elem>hi</elem><elem>hi2</elem></listtest>";

x = xml.fromString(s);

assert(x._name == "listtest");
assert(x._props == null);
assert(x["$"][0]._name == "elem");
assert(x["$"][0]["$"] == "hi");
assert(x["$"][1]._name == "elem");
assert(x["$"][1]["$"] == "hi2");

s = "<nulllisttest><elem/><elem>hi</elem></nulllisttest>";
x = xml.fromString(s);


assert(x._name == "nulllisttest");
assert(x["$"][0]._name == "elem");
assert(x["$"][0]["$"] == null);
assert(x["$"][1]["$"] == "hi");
assert(x["$"][1]._name == "elem");

s = "<?xml version=\"1.0\" ?><methodResponse><params><param><value><struct><member><name>difference</name><value><i4>3</i4></value></member><member><name>sum</name><value><i4>9</i4></value></member></struct></value></param></params></methodResponse>";
x = xml.fromString(s);

assert(x["$"][0]["$"][0]["$"][0]["$"][0]["$"][0]._name == "member");
assert(x["$"][0]["$"][0]["$"][0]["$"][0]["$"][0]["$"][0]._name == "name");
assert(x["$"][0]["$"][0]["$"][0]["$"][0]["$"][0]["$"][0]["$"] == "difference");

s = "        <     ?        xml         version        =        \"1.0\"        ?        ><     spaceytest       a       =       'yo'         >        <        elem         /        >       <         elem2        >hi<        /           elem2        >       <       / spaceytest      >";

//dump(s);
x = xml.fromString(s);
assert(x._name == "spaceytest");
assert(x._props.a == "yo");
assert(x["$"][0]["$"] == null);
assert(x["$"][0]._name == "elem");
assert(x["$"][1]._name == "elem2");
assert(x["$"][1]["$"] == "hi");


s = "  \n< \n  ?  xml   version  =  \"1.0\"  \n?  >\n  <  newlinetest \n  > \t <  \n elem\tattr\n= 'hi'\t>  \ncdata     \n \t< \n/\telem>\t<\nelem\n\t/><elem /\n> </newlinetest>";
newlinetest = s;
x = xml.fromString(s);


assert(x._name == "newlinetest");
assert(x["$"][0]._props.attr == "hi");
assert(x["$"][0]._name == "elem");
assert(x["$"][0]["$"] == "cdata");
assert(x["$"][1]._name == "elem");
assert(x["$"][1]["$"] == null);
assert(x["$"][2]._name == "elem");
assert(x["$"][2]["$"] == null);

var x = xml.fromString("<result><param><value>0</value><value>1</value></param><value>3</value></result>");

var f = xml.find(x, {_name: "value"});
assert(f.length == 3);
assert(f[0]._name == "value");
assert(f[1]._name == "value");
assert(f[2]._name == "value");
