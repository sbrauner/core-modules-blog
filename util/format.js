core.content.html();

Util.format_htmlattr = function(obj){
    // Transform an object full of k:v pairs to a string full of "k=\"v\""
    // elements (for embedding as attributes in an HTML element).
    //
    // Useful after you've removed all the excess parameters for your function.
    var s = "";
    var first = false;
    var keypair = function(key, value){
        if(first) s += " "; else first = true;
        s += key + "=" + '"' + content.HTML.escape_html(value) + '"';
    }
    if(obj instanceof Array){
        for(var i = 0; i < obj.length; i++){
            keypair(obj[i].key, obj[i].value);
        }
    }
    else {
        for(var prop in obj){
            keypair(prop, obj[prop]);
        }
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

