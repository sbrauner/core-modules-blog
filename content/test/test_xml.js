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

