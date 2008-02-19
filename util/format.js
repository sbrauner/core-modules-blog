Util.format_htmlattr = function(obj){
    // Transform an object full of k:v pairs to a string full of "k=\"v\""
    // elements (for embedding as attributes in an HTML element).
    //
    // Useful after you've removed all the excess parameters for your function.
    s = "";
    for(var prop in obj){
        s += prop + "=";
        s += '"' + obj[prop] + '"' + " ";
    }
    return s;
};

Util.format_queryargs = function(obj){
    var s = "";
    for(var prop in obj){
        s += prop + "=" + obj[prop] + "&";
    }
    return s.substring(0, s.length-1);
};

