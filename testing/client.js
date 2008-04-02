testing.Client = function(){
    this.cookies = {};
    this.headers = [];
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

testing.Client.prototype.getResponse = function(){
    var t = this;
    var response = { sendRedirectTemporary: function(){ t.sendRedirectTemporary.call(t, arguments); },
                     addCookie: function(key, val){ t.addCookie(key, val); }
                   };
    return response;
};

