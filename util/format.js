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

Util.escape_queryargs = function(s){
    var re = /[^A-Za-z\.-_~]/;
    var strhex = '0123456789abcdef';
    var t = '';
    while(true){
        print(s);
        var exec = re.exec(s);
        if(exec == null) break;
        var i = exec.index;
        t = t + s.substring(0, i);
        if(s[i] == ' '){
            var rep = '+';
        } else {
            var n = s.charCodeAt(i);
            var rep = '%'+strhex.charAt(Math.floor(n/16))+strhex.charAt(n%16);
        }
        t = t+rep;
        s = s.substring(i+1, s.length);
    }
    t = t + s;
    return t;
};
