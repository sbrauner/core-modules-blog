/**
 * Copyright Statement
 * License
 *
 * Filename: html.js
 * Author: Dana Spiegel (dana@10gen.com)
 */
 
if (!HTML) HTML = {};

if (!HTML.__init) {

    HTML.encode = function(s) {
        return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : s;
    };
 
    HTML.__init = true;
}
