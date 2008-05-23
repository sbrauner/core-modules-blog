/**
 * loader.js
 *
 * template related stuff for djang10
 *
 *  modeled after  django.template package
 */

core.templates.djang10();
core.djang10.template.template();

Loader = {
    get_template: function(name){
        var template = djang10.loadTemplate(name);
        
        return new Template(template);
    },
    
    getTemplate: function(name){
        return Loader.get_template(name);
    }
};