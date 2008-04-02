core.ext.redirect();

testing.Client = function(){
    this.cookies = {};
    this.headers = [];
    this.redirects = [];
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
    return headers.join("\n");
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
    this.query = location;
};

testing.Client.prototype.getResponse = function(){
    var t = this;
    var response = { sendRedirectTemporary: function(location){ t.addRedirect('temporary', location); },
                     addCookie: function(key, val){ t.addCookie(key, val); }
                   };
    return response;
};

testing.Client.prototype.setURL = function(query){
    this.query = query || '/';
    return this;
};

// testing.Client.prototype.setArgs = function(args){

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
    answer = this.answer || 'output';
    request = this.getRequest(this.query);
    response = this.getResponse();
    var val = Ext.redirect(f);
    if(answer in val) return val[answer];
    if(answer in this) return this[answer];
    return val;
};
