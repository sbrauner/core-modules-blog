URI = function(s){
    if(s.indexOf('://') == -1){
        this.scheme = 'http';
    } else {
        this.scheme = s.substring(0, s.indexOf('://'));
        s = s.substring(s.indexOf('://')+3, s.length);
    }
    this.hostname = s.substring(0, s.indexOf('/'));
    s = s.substring(s.indexOf('/'), s.length);

    this.args = [];
    if(s.indexOf('?') == -1){
        this.path = s;
    } else {
        this.path = s.substring(0, s.indexOf('?'));
        s = s.substring(s.indexOf('?')+1, s.length);
        var cont = true;
        while(cont){
            if(s.indexOf('&') == -1){
                cont = false;
                var pair = s;
            }
            else {
                var pair = s.substring(0, s.indexOf('&'));
                s = s.substring(s.indexOf('&')+1, s.length);
            }
            var key = pair.substring(0, pair.indexOf('='));
            var val = pair.substring(pair.indexOf('=')+1, pair.length);
            this.args.push({key: key, value: val});
        }
    }
};

core.util.format();
URI.prototype.toString = function(){
    if(this.hostname)
        var str = this.scheme + "://" + this.hostname + this.path;
    else
        var str = this.path;
    var encodeURIComponent = Util.escape_queryargs;
    if(this.args.length > 0){
        str += '?';
        for(var i in this.args){
            str += encodeURIComponent(this.args[i].key) + '=' + encodeURIComponent(this.args[i].value) + '&';
        }
        str = str.substring(0, str.length-1);
    }
    return str;
};

URI.prototype.addArg = function(key, value){
    this.args.push({key: key, value: value});
    return this;
};

URI.prototype.replaceArg = function(key, value){
    for(var i in this.args){
        if(this.args[i].key == key){
            this.args[i].value = value;
            return this;
        }
    }
    return this.addArg(key, value);
};

URI.prototype.removeArg = function(key){
    var start = false;
    for(var i in this.args){
        if(!start && this.args[i].key == key){
            start = true;
        }
        else if(start) {
            this.args[i-1] = this.args[i];
        }
    }
    this.args.pop();
    return this;
};

