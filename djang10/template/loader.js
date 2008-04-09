/**
 * loader.js
 *
 * template related stuff for djang10
 *
 *  modeled after  django.template package
 */

function Loader() {
}

Loader.get_template = function(name) {
    return name;
}

Loader.getTemplate = function(name) {
    return Loader.get_template(name);
}