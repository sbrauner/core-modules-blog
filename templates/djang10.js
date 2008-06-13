var nativeHelper = globals[javaStaticProp("ed.appserver.templates.djang10.JSHelper", "NS")];

if(djang10 == null)
    djang10 = {};

Object.extend(djang10, {
    addTemplateRoot : function(newRoot) {
        nativeHelper.addTemplateRoot(newRoot);
    },
    
    loadTemplate : function(name) {
        return nativeHelper.loadPath(name);
    },
    
    Context : nativeHelper.Context
});

djang10.Context.prototype.push = nativeHelper.Context.__push;
djang10.Context.prototype.pop = nativeHelper.Context.__pop;

return djang10;
