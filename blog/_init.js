var djang10 = core.templates.djang10();
djang10.addTemplateRoot(core.blog.pieces);

/*
 *  Blog App Module
 */

Blog = {};

__path__.post();
__path__.category();
__path__.ping();

/*
 *   Array of roots to search, in array order.  Used by embedding apps to override the
 *   template search path.  Adds the default for the blog first, so it's the last one checked
 */
Blog._templateRoots = ["/corejs/blog/pieces"];
log("path: "+__path__.pieces);
Blog._templateRoots.unshift(__path__.pieces);

/**
 *   options for this usage.  Set in blog.install.js
 */
Blog._options = {};

/**
 *  Adds a directory for templates to the search path.
 *  @param {path object} root path to search (ex. __path__.blog.templates)
 */
Blog.addTemplateRoot = function(root) {
	Blog._templateRoots.unshift(root);
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

	var result = null;

	//  uses the new "each()" method of JSArray w/ the Ruby foreach() semantics
	Blog._templateRoots.each(
		function(root) {

			if (!root) {
				return;
			}
			result = root[templateName];
			return result == null;
		 }
	);

	return result;
}

/*
 *  set up default routing to the blog index page to do standard blog presentation
 */
core.core.routes();
Blog.routes = new Routes();
Blog.routes.setDefault("/~~/blog/index.jxp");
