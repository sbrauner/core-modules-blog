core.net.url();

testing.HttpUnit = function(){
    this._wc = javaCreate("com.meterware.httpunit.WebConversation");
    javaStatic('com.meterware.httpunit.HttpUnitOptions', 'setScriptingEnabled', false);
};

Object.extend(testing.HttpUnit.prototype, {
    getResponse: function(url){
        var resp;
        try {
            resp = this._wc.getResponse(url);
        }
        catch(e){
            if(e.getMessage().match(/Digest authentication/)){
                // Strip off Exception type
                var auth = e.getMessage().replace(/^.+?:/, '').trim();
                // Strip off "Digest authentication required"
                var auth = auth.replace(/^.+?:/, '').trim();
                var things = {};
                digestThings = things;
                var idx = auth.indexOf( "=" );
                while ( idx > 0 ){
                    var name = auth.substring( 0 , idx ).trim();
                    var val = null;

                    auth = auth.substring( idx + 1 ).trim();
                    if ( auth.startsWith( "\"" ) ){
                        auth = auth.substring(1);
                        idx = auth.indexOf( "\"" );
                        val = auth.substring( 0 , idx );
                        auth = auth.substring( idx + 1 ).trim();
                    }
                    else {
                        var spaceidx = auth.indexOf( " " );
                        var commaidx = auth.indexOf( "," );

                        if ( spaceidx < 0 && commaidx < 0 )
                            idx = auth.length;
                        else if ( spaceidx < 0 )
                            idx = commaidx;
                        else if ( commaidx < 0 )
                            idx = spaceidx;
                        else
                            idx = Math.min( commaidx , spaceidx );

                        val = auth.substring( 0 , idx );
                        if ( val.endsWith( "," ) )
                            val = val.substring( 0 , val.length - 1 );
                        auth = auth.substring( idx + 1 ).trim();
                    }

                    things[name] = val;
                    if ( auth.startsWith( "," ) )
                        auth = auth.substring( 1 ).trim();
                    idx = auth.indexOf( "=" );
                }

                var username = this.username;
                var password = this.password;

                var mynonce = "1"; // super secure client nonce
                var noncecount = "1"; // super accurate nonce count

                var urlObj = new URL(url);

                var ha1 = md5(username+':'+things.realm+':'+password);
                var ha2 = md5('GET:'+urlObj.path);
                var response = md5([ha1, things.nonce, noncecount, mynonce, things.qop, ha2].join(':'));

                var respstring = "Digest username=\"" + username +
                    "\", nonce=\""+things.nonce + "\", qop=\""+things.qop+
                    "\", cnonce=\"" + mynonce + "\", nc=\""+noncecount+
                    "\", response=\""+ response +"\"";
                var respkey = "Authorization";
                print("header: " + respkey + "=" + respstring);
                this._wc.setHeaderField(respkey, respstring);
                resp = this._wc.getResponse(url);
            }
            else{ throw e; }
        }
        return resp;
    },
    setAuthorization: function(u, p){
        this.username = u;
        this.password = p;
    },
});
