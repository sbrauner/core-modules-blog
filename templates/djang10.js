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
    
    Context : nativeHelper.Context,
    
    addModuleRoot : function(newRoot) {
        return nativeHelper.addModuleRoot(newRoot);
    },
    
    Library : nativeHelper.Library
});

djang10.Context.prototype.push = nativeHelper.Context.__push;
djang10.Context.prototype.pop = nativeHelper.Context.__pop;

Object.extend(djang10.Library.prototype, {
    filter: function(filterName, filterFunc) {
        this.__filter(filterName, filterFunc);
    },
    tag : function(tagName, tagFunc) {
        this.__tag(tagName, tagFunc);
    }
});


return djang10;
