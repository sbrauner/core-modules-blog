
Rails.mapURI = function( uri ){
    
    var mime = MimeTypes.get( uri );
    
    if ( (  mime && 
            ( mime.startsWith( "image/" ) 
              || mime.startsWith( "video/" )
            ) )
         ||
         uri.match( /\.(css|js)$/ )
       )
        return "/public" + uri;
         
    return "/~~/rails/rails.jxp";
};

function ApplicationController(){
    this.shortName = null;
    this.className = null;
};

ApplicationController.prototype.__magic = 17;

ApplicationController.prototype.dispatch = function( request , response , matchingRoute ){

    var f = this[matchingRoute.action];
    if ( ! f ){
        print( "can't find [" + matchingRoute.action + "] in [" + this.className + "]" );
        return;
    }
    
    var appResponse = new ApplicationResponse( this , matchingRoute.action );

    // --- setup scope
    
    var funcScope = f.getScope( true );

    funcScope.render_text = function(s){
        print( s );
        appResponse.anythingRendered = true;
    };
    
    funcScope.respond_to = function( b ){
        b.call( appResponse.requestThis , appResponse );
    };
    
    funcScope.params = new Rails.Params( request );

    // --- invoke action

    f.call( appResponse.requestThis );
    
    if ( ! appResponse.anythingRendered ){
        
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



function ApplicationResponse( controller , method ){

    this.controller = controller;
    assert( this.controller );

    this.method = method;
    assert( this.method );

    this.anythingRendered = false;

    this.requestThis = Rails.baseThis.child();

};

ApplicationResponse.prototype.html = function(){

    var blah = this.requestThis;

    if ( arguments.length > 0 && isFunction( arguments[0] ) ){
        arguments[0].call( blah );
        return;
    }

    if ( ! local.app.views )
        throw "no views directory";
    
    if ( ! local.app.views[ this.controller.shortName ] )
        throw "no view directory for : " + this.controller.shortName;
   
    var template = local.app.views[ this.controller.shortName ][ this.method + ".html" ];
    if ( ! template )
        throw "no template for " + this.controller.shortName + ":" + this.method;
    log.rails.response.debug( template + ".html" + called );
    
    var layout = null;
    if ( local.app.views.layouts )
        layout = local.app.views.layouts[ this.controller.shortName + ".html" ];
    

    if ( layout ){
        // TODO: fix this...
        layout.getScope( true ).controller = { action_name : this.method };
        
        layout( function(){
            template.apply( blah , arguments );
        } );
    }
    else {
        template.apply( blah );
    }
        
    this.anythingRendered = true;
};

ApplicationResponse.prototype.xml = function(){
    return false;
};
