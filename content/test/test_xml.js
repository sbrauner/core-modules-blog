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

assert(x.emptytest == "");

s = "<multtest><elem1>hi</elem1><elem2>yo</elem2></multtest>";

x = xml.fromString(s);

assert(x.multtest.elem1 == "hi");
assert(x.multtest.elem2 == 'yo');

x = { a: ['di', 'yo']};
print(xml.toString("listtest", x));
