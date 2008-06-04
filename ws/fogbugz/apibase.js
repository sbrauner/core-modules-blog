
// ---- login/logout

ws.FogBugz.prototype._command = function( cmd , params ){
    var url = this.url + "cmd=" + cmd;
    
    for ( var k in params )
        url += "&" + k + "=" + escape( params[k] );
    
    if ( this._token )
        url += "&token=" + this._token;

    this.log( url );
    
    var x = new XMLHttpRequest( "GET" , url );
    if ( ! x.send() )
        throw "error";

    var dom = xml.parseDomFromString( x.responseText );
    dom._raw = x.responseText;
    return dom;
}

ws.FogBugz.prototype._login = function(){
    if ( this._token )
        return this._token;
    
    var res = this._command( "logon" , { email : this.email , password : this.password } );
    var tokenNode = res.getAllByTagName( "token" );

    if ( tokenNode.length == 0 )
        throw "no token node";

    if ( tokenNode.length > 1 )
        throw "why are there more than 1 token node";
    
    tokenNode = tokenNode[0];
    this._token = tokenNode.textString;
    return tokenNode.textString;
};

ws.FogBugz.prototype.done = function(){
    if ( ! this._token )
        return;

    if ( this._passedInToken ) // don't logoff permanent token
        return;

    this._command( "logoff" , {} );
}
