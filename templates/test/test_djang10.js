var djang10 = core.templates.djang10();


djang10.addTemplateRoot("/core/templates/test/res");

var oldPrint = print;
var buffer = "";
var print = function(str){ buffer += str + "\n"; };

core.templates.test.res.includer();

print = oldPrint;

assert(buffer.replace(/\s/g,"") == "moo")
