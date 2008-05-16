djang10 = {
    addTemplateRoot : function(newRoot) {
        var namespace = javaStaticProp("ed.appserver.templates.djang10.JSHelper", "NS")
        globals[namespace].addTemplateRoot(newRoot);
    },
    
    loadTemplate : function(templateName) {
    	
    }

};

return djang10;
