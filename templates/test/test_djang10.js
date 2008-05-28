var djang10 = core.templates.djang10();


djang10.addTemplateRoot("/core/templates/test/res");

var oldPrint = print;
var buffer = "";
var print = function(str){ buffer += str + "\n"; };

var c = new djang10.Context({a: "A", b:"B"});
c.push();
c.c = "C";
c.push();
c.d = "D";
c.pop();
//Test addTemplateRoot
core.templates.test.res.includer(c);

//Test loadTemplate
djang10.loadTemplate("includee")();

print = oldPrint;

log(buffer.replace(/\s/g,"") )//== "mooABCmoo")



