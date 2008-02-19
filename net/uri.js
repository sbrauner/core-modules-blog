URI = function(s){
    // This class is a representation of a URI. Right now it is mostly
    // intended to support adding/replacement/removal of query args, but it could
    // presumably be used for other URI-related things too.
    // Query args are stored in an array, since there can be more than one of the
    // same arg in a URI.
    // (If we ever write a multidict or anything, it should be used here.)

    // Parse scheme and hostname. Sometimes this is absent
    // (the URI starts with a slash).
    if(s.indexOf('://') == -1){
        this.scheme = 'http';
    } else {
        this.scheme = s.substring(0, s.indexOf('://'));
        s = s.substring(s.indexOf('://')+3, s.length);
    }
    this.hostname = s.substring(0, s.indexOf('/'));
    s = s.substring(s.indexOf('/'), s.length);

    // Parse the anchor, path and query args (if any).
    this.args = [];
    this.anchor = "";
    // Check for an anchor first, and trim it.
    if(s.indexOf('#') != -1){
        this.anchor = s.substring(s.indexOf('#')+1, s.length);
        s = s.substring(0, s.indexOf('#'));
    }
    if(s.indexOf('?') == -1){
        this.path = s;
    } else {
        this.path = s.substring(0, s.indexOf('?'));
        s = s.substring(s.indexOf('?')+1, s.length);
        var ary = s.split('&');
        for(var i in ary){
            var pair = ary[i].split('=');
            this.args.push({key: pair[0], value: pair[1]});
        }
    }
};

URI.prototype.toString = function(){
    // Generate the string for this URI object.
    if(this.hostname)
        var str = this.scheme + "://" + this.hostname + this.path;
    else
        var str = this.path;
    var encodeURIComponent = URI.escape_queryargs;
    if(this.args.length > 0){
        str += '?';

        str += this.args.map(function(a){return encodeURIComponent(a.key)+'='+encodeURIComponent(a.value);}).join('&');
    }
    if(this.anchor) str += "#"+encodeURIComponent(this.anchor);
    return str;
};

URI.prototype.clone = function(){
    // Clone a URI object. FIXME: when we get Prototype working, use their
    // Object.clone method.
    return new URI(this.toString());
};

URI.prototype.addArg = function(key, value){
    // Add a query arg to this URI.
    // @return a new URI, with the additional query argument added.
    c = this.clone();
    return c._addArg(key, value);
};

URI.prototype._addArg = function(key, value){
    this.args.push({key: key, value: value});
    return this;
};

URI.prototype.replaceArg = function(key, value){
    // Replace the first query arg with the key "key" with the value "value".
    // If there is no query arg with key "key", then just add a key:arg pair at the
    // end.
    // @return a new URI, with the old query argument (if any) removed and a new
    //    one added.
    c = this.clone();
    return c._replaceArg(key, value);
};

URI.prototype._replaceArg = function(key, value){
    for(var i in this.args){
        if(this.args[i].key == key){
            this.args[i].value = value;
            return this;
        }
    }
    return this._addArg(key, value);
};

URI.prototype.removeArg = function(key){
    // Remove the first arg with the key "key" from a URI.
    // @return a new URI with either the same args (if none had the right key) or
    //         one less arg (if that arg had the same key).
    c = this.clone();
    c._removeArg(key);
    return c;
};

URI.prototype._removeArg = function(key){
    var start = false;
    for(var i in this.args){
        if(!start && this.args[i].key == key){
            start = true;
        }
        else if(start) {
            this.args[i-1] = this.args[i];
        }
    }
    if(start)
        this.args.pop();
    return this;
};

URI.escape_queryargs = function(s){
    // This temporary function is meant to be roughly equivalent to the JS
    // encodeURIComponent function, which isn't implemented yet in the appserver.
    var re = /[^A-Za-z0-9\._~-]/;
    var strhex = '0123456789abcdef';
    var t = '';
    while(true){
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
