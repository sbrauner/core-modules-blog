
core.content.xml();

ws.FogBugz = function( url , email , password , token ){
    this.url = url;
    if ( ! this.url.endsWith( "?" ) )
        this.url += "?";

    this.email = email;
    this.password = password;
    
    if ( token ){
        this._token = token;
        this._passedInToken = true;
    }
};

__path__.core();
__path__.apibase();

ws.FogBugz.prototype.log = log.ws.fogbugz;

ws.FogBugz.prototype.listProjects = function(){
    
    var projects = {};
    
    var res = this._command( "listAreas" );
    res.getAllByTagName( "area" ).forEach( 
        function( a ){
            var areaName = a.getSingleChild( "sArea" ).textString;
            
            var projectName = a.getSingleChild( "sProject" ).textString;
            
            var p = projects[ projectName ];
            if ( ! p ){
                p = new ws.FogBugz.Project( projectName );
                projects[ projectName ] = p;
            }
            p.areas.add( areaName );
        }
    );

    return projects;
}

ws.FogBugz.prototype.listPeople = function(){
    var res = this._command( "listPeople" );

    var all = [];

    res.getAllByTagName( "person" ).forEach(
        function(z){
            var p = new ws.FogBugz.Person( z );
            all.add( p );
        }
    );
    
    return all;
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

ws.FogBugz.prototype.save = function( theCase ){
    this._login();
    
    var r = this._command( theCase.ixBug ? "edit" : "new" , theCase );
    print( tojson( r ) );
}

__path__["case"]();
__path__["person"]();
__path__["project"]();
