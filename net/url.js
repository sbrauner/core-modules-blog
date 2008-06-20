URL = function(s){
    // This class is a representation of a URL. Right now it is mostly
    // intended to support adding/replacement/removal of query args, but it could
    // presumably be used for other URL-related things too.
    // Query args are stored in an array, since there can be more than one of the
    // same arg in a URL.
    // (If we ever write a multidict or anything, it should be used here.)

    // Parse scheme and hostname. Sometimes this is absent
    // (the URL starts with a slash).
    this.scheme = "";
    this.hostname = "";
    this.args = [];
    this.path = "";
    this.anchor = "";

    if(s.indexOf('://') == -1){
        this.scheme = 'http';
    } else {
        this.scheme = s.substring(0, s.indexOf('://'));
        s = s.substring(s.indexOf('://')+3, s.length);
    }
    this.hostname = s.substring(0, s.indexOf('/'));
    if(this.hostname.indexOf(':') != -1){
        this.port = this.hostname.substring(this.hostname.indexOf(':')+1,
                                            this.hostname.length);
        this.hostname = this.hostname.substring(0, this.hostname.indexOf(':'));
    }
    s = s.substring(s.indexOf('/'), s.length);

    // Parse the anchor, path and query args (if any).
    this.args = [];
    this.anchor = "";
    // Check for an anchor first, and trim it.
    // Note that we don't get an anchor from an incoming request!
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
        if ( ary && ary.length > 0 ){
            for(var i in ary){
                var temp = ary[i];
                var idx = temp.indexOf( "=" );
                if ( idx < 0 )
                    continue;
                this.args.push( { key: temp.substring( 0 , idx ) ,
                                  value: URL.unescape_queryargs( temp.substring( idx + 1 ) ) } );
            }
        }
    }
};

LocalURL = function(path){
    // Don't call using new, bad things happen
    // Tests not yet written
    path = path || request.getURL();
    var u = new URL(path);
    u.hostname = request.getHost();
    u.port = request.getPort();
    return u;
};

URL.prototype.toString = function(){
    // Generate the string for this URL object.
    if(this.hostname){
        var str = this.scheme + "://" + this.hostname;
        if(this.port)
            str = str+':'+this.port;
        str += this.path;
    }
    else
        var str = this.path;

//    var encodeURIComponent = URL.escape_queryargs;
    if(this.args.length > 0){
        str += '?';

        str += this.args.map(function(a){
            if(a.key == null || a.value == null)
                throw "bad args " + tojson(this.args);
            return encodeURIComponent(a.key)+'='+encodeURIComponent(a.value);
        }).join('&');
    }
    if(this.anchor) str += "#"+encodeURIComponent(this.anchor);
    return str;
};

URL.prototype.clone = function(){
    // Clone a URL object. FIXME: when we get Prototype working, use their
    // Object.clone method.
    return new URL(this.toString());
};

URL.prototype.addArg = function(key, value){
    // Add a query arg to this URL.
    // Be careful! If you create a new URL from the current URL,
    // and add the same argument, you'll end up with a long list of
    // query arguments. Please consider replaceArg instead.
    // @return a new URL, with the additional query argument added.
    var c = this.clone();
    return c._addArg(key, value);
};

URL.prototype._addArg = function(key, value){
    this.args.push({key: key, value: value});
    return this;
};

URL.prototype.addArgs = function(obj){
    var c = this.clone();
    return c._addArgs(obj);
};

URL.prototype._addArgs = function(obj){
    for(var key in obj){
        this._addArg(key, obj[key]);
    }
    return this;
};

URL.prototype.replaceArg = function(key, value){
    // Replace the first query arg with the key "key" with the value "value".
    // If there is no query arg with key "key", then just add a key:arg pair at the
    // end.
    // @return a new URL, with the old query argument (if any) removed and a new
    //    one added.
    var c = this.clone();
    return c._replaceArg(key, value);
};

URL.prototype._replaceArg = function(key, value){
    if(key == null) throw "key is null";
    if(value == null) throw "value is null";
    for(var i in this.args){
        if(this.args[i].key == key){
            this.args[i].value = value;
            return this;
        }
    }
    return this._addArg(key, value);
};

URL.prototype.removeArg = function(key){
    // Remove the first arg with the key "key" from a URL.
    // @return a new URL with either the same args (if none had the right key) or
    //         one less arg (if that arg had the same key).
    var c = this.clone();
    c._removeArg(key);
    return c;
};

URL.prototype._removeArg = function(key){
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

URL.prototype.clearArgs = function(){
    var c = this.clone();
    c._clearArgs();
    return c;
};

URL.prototype._clearArgs = function(){
    this.args = [];
};

// I can never remember the right name for these!
URL.prototype.addQuery = URL.prototype.addArg;
URL.prototype.replaceQuery = URL.prototype.replaceArg;
URL.prototype.removeQuery = URL.prototype.removeArg;
URL.prototype.clearQueries = URL.prototype.clearArgs;

URL.prototype.replaceLastPath = function(s){
    var c = this.clone();
    c._replaceLastPath(s);
    return c;
};

URL.prototype._replaceLastPath = function(s){
    var components = this.path.split('/');
    components.pop();
    components.push(s);
    this.path = components.join('/');
};

URL.prototype.setPath = function(s){
    var c = this.clone();
    c._setPath(s);
    return c;
};

URL.prototype._setPath = function(s){
    this.path = s;
};

URL.escape_queryargs = function( s , plusIsLiteral ){
    // This temporary function is meant to be roughly equivalent to the JS
    // encodeURIComponent function, which isn't implemented yet in the appserver.

    // The *real* encodeURIComponent doesn't replace spaces with +, but instead
    // uses %20. We support this with the "broken" parameter (if true, use %20).

    if ( ! plusIsLiteral ) s = s.replace( / /g , "+" );

    return escape( s );
};

URL.unescape_queryargs = function( s, plusIsLiteral ){
    // Analagously to escape_queryargs, support treating + signs as + signs
    // (rather than really as spaces). This doesn't usually come up, because
    // plus signs are usually encoded into %2b, so no "raw" plus signs come
    // through unless they were encoded from spaces.
    if( ! plusIsLiteral ) s = s.replace( /\+/g , ' ');

    return unescape( s );
};
