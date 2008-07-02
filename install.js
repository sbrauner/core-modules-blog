/*
 *  blog app-module installation script
 */
 
Blog._options = arguments[0] || {}
Blog._options.tinyMCEVersion = Blog._options.tinyMCEVersion || Blog._defaultTinyMCE;

addModule("blog", Blog._options);
 
return Blog;
