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

    f.getScope(true).print = function(s) { myBuf += s;};

    f(context.getRawStorageObject());
    
    f.clearScope();

    return myBuf;
}