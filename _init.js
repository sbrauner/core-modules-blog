/*
 * Blog imports
 */
log("rerunning init");
core.user.user();
core.user.auth();
core.modules.blog.blogDTO();
core.core.mail();

/**
 *  Blog App Module
 */
Blog = {};

/**
 * Handles HTTP requests to the blog module
 */
Blog.urls = core.modules.blog.urls();

/**
 * Utilities for fetching various types of posts.
 */
Blog.blogUtils = core.modules.blog.utils();

__path__.post();
__path__.category();
__path__.ping();

/*
 *  initialize djang10 framework and add our default templates
 */
djang10.addTemplateRoot(core.modules.blog.pieces);

/**
 *   options for this usage.  Set in blog.install.js
 */
Blog._options = {};

/**
 *   default TinyMCE version to load in post_edit and category_edit
 */
Blog._defaultTinyMCE = 'current';

/**
 *  function to call right before rendering to allow the user to
 *  provide a callback to fill the model with additional data
 */
Blog._modelCallback = __path__.modelCallbackDefault;

/** Sets the model callback, which can be used to provide data for site-specific sections.
 * @param {function} callback callback function
 */
Blog.setModelCallback = function(callback) {
    Blog._modelCallback = callback;
}

/** Retreives the model callback function.
 */
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
 * @return {Routes} the routes the blog is using
 */
Blog.getRoutes = function() {
        return Blog.routes;
}

/**
 *   Finds a template.  Searches the _templatesRoots array starting at the beginning
 *   @param {string} templateName name of template to find.  Do not include extension
 *   @return {djang10Template} a template with a given name
 */
Blog.getTemplate = function(templateName) {
        return djang10.loadTemplate(templateName);
}

/*
 *  set up default routing to the blog index page to do standard blog presentation
 */
core.core.routes();
Blog.routes = new Routes();
Blog.routes.add("rss", "/~~/modules/blog/rss.jxp");
Blog.routes.setDefault("/~~/modules/blog/index.jxp");
