var nativeHelper = globals[javaStaticProp("ed.appserver.templates.djang10.JSHelper", "NS")];

djang10 = {
    addTemplateRoot : function(newRoot) {
        nativeHelper.addTemplateRoot(newRoot);
    },
    
    loadTemplate : function(name) {
        return nativeHelper.loadPath(name);
    },
    
    Context : nativeHelper.Context
};

djang10.Context.prototype.push = nativeHelper.Context.__push;
djang10.Context.prototype.pop = nativeHelper.Context.__pop;

return djang10;
