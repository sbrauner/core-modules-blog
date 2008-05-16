var nativeHelper = globals[javaStaticProp("ed.appserver.templates.djang10.JSHelper", "NS")];

djang10 = {
    addTemplateRoot : function(newRoot) {
        nativeHelper.addTemplateRoot(newRoot);
    },
    loadTemplate : function(name) {
        return nativeHelper.loadPath(name);
    }
};

return djang10;
