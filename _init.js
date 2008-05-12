Blog = {};

/*
 *  set up default routing to the blog index page to do standard blog presentation
 */
core.core.routes();
Blog.routes = new Routes();
Blog.routes.setDefault("/~~/blog/index.jxp");
