core.ext.redirect();
core.net.url();
core.user.user();

testing.Client = function(){
    this.cookies = {};
    this.headers = [];
    this.redirects = [];
    this.url = new URL('/');
    this.ip = "127.0.0.1";
};

testing.Client.prototype.getHeaders = function(){
    var headers = this.headers;
    var cookieStrings = [];
    for(var key in this.cookies){
        cookieStrings.push(key + '=' + this.cookies[key]);
    }
    if(cookieStrings.length > 0){
        headers = headers.concat(["Cookie: " + cookieStrings.join("; ")]);
    }
    headers = headers.concat(["X-Cluster-Client-Ip: " + this.ip]);
    headers = headers.concat(["Host: " + this.url.hostname + (this.url.port ? ":"+this.url.port : "")]);

    return headers.join("\n");
};

testing.Client.prototype.setIP = function(ip){
    this.ip = ip;
};

testing.Client.prototype.addHeader = function(header){
    this.headers.push(header);
};

testing.Client.prototype.getRequest = function(query){
    return javaStatic("ed.net.httpserver.HttpRequest", "getDummy", query,
                      this.getHeaders());
};

testing.Client.prototype.addCookie = function(key, val){
    this.cookies[key] = val;
};

testing.Client.prototype.addRedirect = function(type, location){
    // FIXME: should this really keep an array of redirects?? should
    // this really set the next location? I have no idea!!
    this.redirects.push({type: type, location: location});
    return this.setURL(location);
};

testing.Client.prototype.getResponse = function(){
    var t = this;
    var response = { sendRedirectTemporary: function(location){ t.addRedirect('temporary', location); },
                     addCookie: function(key, val){ t.addCookie(key, val); }
                   };
    return response;
};

testing.Client.prototype.setURL = function(query){
    this.url = new URL(query || '/');
    return this;
};

testing.Client.prototype.addArgs = function(args){
    this.url = this.url.addArgs(args);
    return this;
};

testing.Client.prototype.addArg = function(key, value){
    this.url = this.url.addArg(key, value);
    return this;
};

testing.Client.prototype.setAnswer = function(answer){
    // answer == 'value' or 'output', and specifies what you care about when
    // you call execute on a function
    this.answer = answer || 'output';
    return this;
};

testing.Client.prototype.execute = function(f){
    // execute "within the context of a request" -- i.e. generate
    // sensible request and response objects and keep track of what happens to
    // them
    this.redirects = [];
    var answer = this.answer || 'output';

    // Explicitly pollute the global namespace
    request = this.getRequest(this.url.toString());
    response = this.getResponse();
    head = Object.extend([], {addScript: function() {},
                              addCSS: function() {} });
    jxp = {};

    var val = Ext.redirect(function(){
        try{
            return f();
        }
        catch(e if (e instanceof Exception.Quiet)){
            return e;
        }
    });
    if(val && answer in val) return val[answer];
    if(answer in this) return this[answer];
    return val;
};

testing.Client.prototype.withPermission = function(perm, f){
    user = new User();
    user.name = "Testing User 1";
    user.addPermission(perm);

    // I can't count 24 zeroes! You must be mad.
    user._id = ['0000', '0000', '0000', '0000', '0000', '0001'].join('');

    var val = this.execute(f);

    return val;
};
