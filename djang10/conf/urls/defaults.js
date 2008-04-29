
/**
 *  10gen Djang10 Framework
 *
 *  Peer file to : django.conf.urls.defaults  
 */

/*
 *   patterns() - to allow urls.js to be written like urls.py
 */
patterns = function() {

    // the first arg is a 'common prefix' to the packages, so prepend it

    var ret = new Array();
    var prefix = arguments[0];

    for (i = 1; i < arguments.length; i++) {

        if (prefix.length > 0) {
            ret[i-1] = [ arguments[i][0], prefix + (prefix.charAt(prefix.length - 1) == "." ? "" : ".") + arguments[i][1]];
        }
        else {
            ret[i-1] = arguments[i];
        }
    }

    return ret;
}