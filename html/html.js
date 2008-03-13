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
        s = s.split("&lt;br /&gt;");
        log("matching: "+s.length);
        var htmlstr="";
        for(var i=0; i<s.length; i++) {
            htmlstr += s[i]+"<br />";
        }
        return htmlstr;
    }

    HTML.__init = true;
}
