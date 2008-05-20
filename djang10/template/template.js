/**
 * template.js
 *
 * template related stuff for djang10
 *
 *  modeled after  django.template package
 */


function Template(name) {
    this.template_name = name;
}

Template.prototype.render = function(context) {

    var myBuf = "";

    scope.setGlobal(true);

    f = scope.eval("jxp." + this.template_name);

    if (f == null) {
        f = scope.eval("core.djang10.templates.notemplatefound");
        f.getScope(true).print = function(s) { myBuf += s;};
        f({"template_name" : this.template_name});
        f.clearScope();
    }
    else {
        f.getScope(true).print = function(s) { myBuf += s;};
        f(context);
        f.clearScope();
    }

    return myBuf;
}