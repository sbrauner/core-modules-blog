
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

ActionController.Base = function(){
    this.shortName = null;
    this.className = null;
    
    this.settings = {};

};


ActionController.Base.prototype = ActionView.Base;

ActionController.Base.prototype.__magic = 17;

function caches_page( name ){
    SYSOUT( "ignore caches_page [" + name + "]" );
};

ActionController.Base.prototype.layout = function( layout ){
    this.layout = layout;
    this.layoutSet = true;
}


// -----------
//   dispatch
// -----------

ActionController.Base.prototype.dispatch = function( request , response , matchingRoute ){

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

    funcScope.redirect_to = function( thing ){
        appResponse.anythingRendered = true;
        print( "<script>window.location = \"" + Rails.routes.getLinkFor( thing ) + "\";</script>" );
        return true;
    };
    
    funcScope.render = function( options ){
        appResponse.html( options );
        appResponse.anythingRendered = true;
    }
    
    // --- invoke action

    this._before( appResponse );

    var aroundFilters = this._getMatchingFilters( appResponse , this.aroundFilters );
    var aroundFiltersPos = 0;
    
    function go(){
        if ( aroundFiltersPos < aroundFilters.length ){
            return aroundFilters[aroundFiltersPos++].call( appResponse.requestThis , go );
        }
        
        f.call( appResponse.requestThis );
        
        if ( ! appResponse.anythingRendered ){
            appResponse.html();
        }
        
    }

    go();


    print( "\n <!-- " + this.className + "." + method + " -->" );
};

ActionController.Base.prototype.toString = function(){
    return "{ shortName : " + this.shortName + " , className : " + this.className + " }";
};


// ----

function ApplicationResponse( controller , method ){

    this.controller = controller;
    assert( this.controller );

    this.method = method;
    assert( this.method );

    this.anythingRendered = false;

    this.requestThis = {};
    this.requestThis.prototype = controller;
};

ApplicationResponse.prototype.html = function( options ){
    options = options || {};

    // did we get an iter block
    if ( arguments.length > 0 && 
         isFunction( arguments[ arguments.length - 1 ] ) ){
        return arguments[arguments.length-1].call( this );
    }
    
    // find the view

    if ( ! local.app.views )
        throw "no views directory";
    
    if ( ! local.app.views[ this.controller.shortName ] )
        throw "no view directory for : " + this.controller.shortName;
   
    var viewName = Rails.unmangleName( options.action || this.method );
    
    var template = 
        local.app.views[ this.controller.shortName ][ viewName + ".html" ] || 
        local.app.views[ this.controller.shortName ][ viewName  ];
    
    if ( ! template )
        throw "no template for " + this.controller.shortName + ":" + viewName;
    log.rails.response.debug( template + ".html" + called );
    

    if ( Rails.helpers.application ){
        Object.extend( this.requestThis , Rails.helpers.application );
    }
    
    if ( Rails.helpers[ this.controller.shortName ] ){
        Object.extend( this.requestThis , Rails.helpers[ this.controller.shortName ] );
    }

    if ( arguments.length > 0 && isFunction( arguments[0] ) ){
        arguments[0].call( this.requestThis );
    }

    
    // layout setup

    var layout = null;
    if ( this.controller.layoutSet )
        layout = this.controller.layout;
    else if ( local.app.views.layouts ){
        layout = 
            local.app.views.layouts[ this.controller.shortName + ".html" ] || 
            local.app.views.layouts.application || 
            local.app.views.layouts["application.html"];
    }


    // execute
    var blah = this.requestThis;

    if ( layout && ( options.layout == null || options.layout ) ){
        
        layout.getScope( true ).controller = { action_name : this.method }; // ???
        
        this.requestThis.content_for( "layout" , template );
        assert( this.requestThis.content_for_layout != null );
        
        layout.call( this.requestThis ,
                     function(  name ){
                         if ( name )
                             return blah["content_for_" + name ]
                         return blah.content_for_layout;
                     }
                   );
    }
    else {
        template.apply( blah );
    }
        
    this.anythingRendered = true;
};

ApplicationResponse.prototype.xml = function(){
    return false;
};
