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

x = { methodName : "weblogUpdates.ping" ,
      params :
      [{_name:"param", value:{string:"SiliconAlleyInsider"}},
       {_name:"param",value:{string:"http://www.alleyinsider.com/"}},
       {_name:"param",value:{string:"http://www.alleyinsider.com/2008/2/barack_obama__live_from_seattle"}}]};

s = xml.toString("danatest", x);
s = strip(s);
target = "<danatest><methodName>weblogUpdates.ping</methodName>"+
    "<params>"+
    "<param><value><string>SiliconAlleyInsider</string></value></param>"+
    "<param><value><string>http://www.alleyinsider.com/</string></value></param>"+
    "<param><value><string>http://www.alleyinsider.com/2008/2/barack_obama__live_from_seattle</string></value></param>"+
    "</params></danatest>";
assert(s == target);

x = [ {_name: "elem", $: {_name: "child", $: "Hi"}},
      {_name: "elem", child: "Yo"},
      {_name: "elem", $: null} ];
s = strip(xml.toString("childrentest", x));

target = "<childrentest><elem><child>Hi</child></elem><elem><child>Yo</child></elem><elem/></childrentest>";
assert(s == target);

x = [ {_name: "elem", _props: {attr1: "sup"}},
      {_name: "elem", _props: {attr1: "hi"}, $: null}];
s = strip(xml.toString("dollartest", x));
target = "<dollartest><elemattr1='sup'></elem><elemattr1='hi'/></dollartest>";
print(target);
print(s);
assert(s == target);