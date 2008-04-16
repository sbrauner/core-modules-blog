
function ApplicationController(){
    
};

ApplicationController.prototype.__magic = 17;

ApplicationController.prototype.wants = function( uri ){

    if ( ! uri.startsWith( "/" + this.shortName ) )
        return false;
    
    var rest = uri.substring( this.shortName.length + 1 );

    if ( rest.length == 0 )
        return "/index";
    
    if ( rest.startsWith( "/" ) )
        return rest;
    
    return false;
};

ApplicationController.prototype.dispatch = function( request , response ){
    var rest = this.wants( request.getURI() );
    assert( rest );
    
    if ( rest.startsWith( "/" ) )
        rest = rest.substring(1);

    if ( rest.length == 0 )
        rest = "index";
    
    var method = null;

    var idx = rest.indexOf( "/" );
    if ( idx < 0 )
        method = rest;
    else
        method = res.substring( 0 , idx );

    var f = this[method];
    if ( ! f ){
        print( "can't find [" + method + "] in [" + this.className + "]" );
        return;
    }
    
    var anythingRendered = false;
    
    f.getScope( true ).render_text = function(s){
        print( s );
        anythingRendered = true;
    };
    
    f( request , response );

    if ( ! anythingRendered ){

        if ( ! local.app.views )
            throw "no views directory";
        
        if ( ! local.app.views[ this.shortName ] )
            throw "no views directory for " + this.shortName;
        
        var view = local.app.views[ this.shortName ][method];
        if ( ! view )
            throw "no view for " + this.shortName + "." + method;
        
        view();
    }

    print( "\n <!-- " + this.className + "." + method + " -->" );
};

ApplicationController.prototype.toString = function(){
    return "{ shortName : " + this.shortName + " , className : " + this.className + " }";
};
