/*
 *  blog app-module installation script
 */
 
Blog._options = arguments[0] || {}

addModule("blog", Blog._options);
 
return Blog;