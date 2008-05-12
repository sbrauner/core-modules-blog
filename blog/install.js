/*
 *  blog app-module installation script
 */
 
addModule("blog", arguments[0] || {});

return Blog.routes;