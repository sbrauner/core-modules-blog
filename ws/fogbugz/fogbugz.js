
core.content.xml();

ws.FogBugz = function( url , email , password ){
    this.url = url;
    if ( ! this.url.endsWith( "?" ) )
        this.url += "?";

    this.email = email;
    this.password = password;
};

ws.FogBugz.prototype.log = log.ws.fogbugz;

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
    
    this._command( "logoff" , {} );
}

// -- main api ---
/** from fogbugz api
** http://www.fogcreek.com/FogBugz/docs/60/topics/advanced/API.html

 q - the query term you are searching for.  
     Can be a string, a case number, a comma separated list of case numbers without spaces, e.g. 12,25,556 .  
     Note, to search for the number 123 and not the case 123, enclose your search in quotes.  
     This search acts exactly the same way the search box in FogBugz operates, so you can use that to debug.
     If q is not present, returns the cases in your current filter.  If the current filter matches a saved or built-in filter, the sFilter is also returned.

 cols - a comma separated list of columns you would like returned.  
         Available columns are listed here in the case xml output.  
         Additional columns: if you include events, you will also receive all the events for that case.  
         Include latestEvent to just get the latest event.

 max - the max number of bugs you want returned.  Leave off if you want them all.

*/
ws.FogBugz.prototype.search = function( q , cols , max ){
    this._login();
    var o = {};

    if ( q )
        o.q = q;
    if ( cols )
        o.cols = cols
    else
        o.cols = ws.FogBugz.ALL_COLUMNS_STRING;
    if ( max )
        o.max = max;

    var res = this._command( "search" , o );
    return res.getAllByTagName( "case" ).map( 
        function(z){
            return new ws.FogBugz.Case( z );
        }
    );

}


ws.FogBugz.ALL_COLUMNS = {
    c  : true ,
    dtClosed  : true ,
    dtDue  : true ,
    dtFixFor  : true ,
    dtLastUpdated  : true ,
    dtLastView  : true ,
    dtOpened  : true ,
    dtResolved  : true ,
    fForwarded  : true ,
    fOpen  : true ,
    fReplied  : true ,
    fScoutStopReporting  : true ,
    fSubscribed  : true ,
    hrsCurrEst  : true ,
    hrsElapsed  : true ,
    hrsOrigEst  : true ,
    ixArea  : true ,
    ixBug  : true , 
    ixBugEventLastView  : true ,
    ixBugEventLatest  : true ,
    ixBugEventLatestText  : true ,
    ixCategory  : true ,
    ixDiscussTopic  : true ,
    ixFixFor  : true ,
    ixGroup  : true ,
    ixMailbox  : true ,
    ixPersonAssignedTo  : true ,
    ixPersonClosedBy  : true ,
    ixPersonLastEditedBy  : true ,
    ixPersonOpenedBy  : true ,
    ixPersonResolvedBy  : true ,
    ixPriority  : true ,
    ixProject  : true ,
    ixRelatedBugs  : true ,
    ixStatus  : true ,
    sArea  : true ,
    sCategory  : true ,
    sComputer  : true ,
    sCustomerEmail  : true ,
    sEmailAssignedTo  : true ,
    sFixFor  : true ,
    sLatestTextSummary  : true ,
    sPersonAssignedTo  : true ,
    sPriority  : true ,
    sProject  : true ,
    sReleaseNotes  : true ,
    sScoutDescription  : true ,
    sScoutMessage  : true ,
    sStatus  : true ,
    sTicket  : true ,
    sTitle  : true ,
    sVersion : true
};

ws.FogBugz.ALL_COLUMNS_STRING = ws.FogBugz.ALL_COLUMNS.keySet().join( "," );

ws.FogBugz.Case = function( xml ){
    this.id = -1;
    if ( xml ){
        this.id = xml.attributes.ixBug;
        for ( var i=0; i<xml.elements.length; i++ ){
            var e = xml.elements[i];
            if ( e.textString )
                this[ e.localName ] = e.textString;
        }
    }
};

ws.FogBugz.Case.prototype.setTitle = function( title ){
    this.sTitle = title;
};


ws.FogBugz.Case.prototype.setProject = function( project ){
    this.sProject = project;
};


ws.FogBugz.Case.prototype.upsert = function( f ){
    
};

ws.FogBugz.Case.prototype.toString = function(){
    var s =  "[ FogBugz Case " + this.id + " " + this.sProject + ":" + this.sTitle + "\n";
    
    s += "\t status:" + this.ixStatus + "\n";
    s += "\t priority:" + this.ixPriority + "\n";
    s += "\t assigned to:" + this.sEmailAssignedTo + "\n";
    
    s += "]";
    return s;
}
