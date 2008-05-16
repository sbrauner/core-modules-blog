var djang10 = core.templates.djang10();


djang10.addTemplateRoot("/core/templates/test/res");

var oldPrint = print;
var buffer = "";
var print = function(str){ buffer += str + "\n"; };

//Test addTemplateRoot
core.templates.test.res.includer();

//Test loadTemplate
djang10.loadTemplate("includee")();

print = oldPrint;

assert(buffer.replace(/\s/g,"") == "moomoo")



