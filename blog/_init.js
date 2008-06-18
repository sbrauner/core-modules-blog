/*
 *  Blog App Module
 */

Blog = {};

__path__.post();
__path__.category();
__path__.ping();

/*
 *  initialize djang10 framework and add our default templates
 */
djang10.addTemplateRoot(core.blog.pieces);

/**
 *   options for this usage.  Set in blog.install.js
 */
Blog._options = {};

/**
 *  function to call right before rendering to allow the user to 
 *  provide a callback to fill the model with additional data
 */
Blog._modelCallback = __path__.modelCallbackDefault;

Blog.setModelCallback = function(callback) { 
    Blog._modelCallback = callback;
}

Blog.getModelCallback = function() { 
    return Blog._modelCallback;
}

/**
 *  Adds a directory for templates to the search path.
 *  @param {path object} root path to search (ex. __path__.blog.templates)
 */
Blog.addTemplateRoot = function(root) {
	djang10.addTemplateRoot(root);
}

/**
 *  Returns the routes object for blog.  Used by apps to set routing delegation.
 */
Blog.getRoutes = function() {
	return Blog.routes;
}

/**
 *   Finds a template.  Searches the _templatesRoots array starting at the beginning
 *   @param {string} templateName name of template to find.  Do not include extension
 */
Blog.getTemplate = function(templateName) {
	return djang10.loadTemplate(templateName);
}

/*
 *  set up default routing to the blog index page to do standard blog presentation
 */
core.core.routes();
Blog.routes = new Routes();
Blog.routes.setDefault("/~~/blog/index.jxp");
