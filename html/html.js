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

    HTML.decodeBr = function(s) {
        return s.replace(/&lt;br \/&gt;/g, "<br />");
    }

    HTML.__init = true;
}
