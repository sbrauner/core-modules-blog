var JSON = {
    check: function(text){
    // JSON validity check from json.org/json2.js
    // We need something like this because our "eval" will return null for
    // undefined variables, so we can't just use eval to check for barewords.
    // (FF pukes on undefined barewords, which is probably the right thing.)
        if (/^[\],:{}\s]*$/.
            test(text.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                 replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    }
    return false;
}
};

return JSON;