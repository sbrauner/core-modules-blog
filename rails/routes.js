
Rails.idRegex = /[0-9a-fA-F]{24}/;

ActionController.Routing = {};

ActionController.Routing.Routes = function(){
    this._inInit = false;
    this.il = log.rails.init.routes;
    this._routes = [];
};

// --------------------------
// ---  internal objects -----
// --------------------------

var RailsURI = function( uri ){
    this.uri = uri;
    uri = uri.replace( /^\/+/ , "" );
    this.pieces = uri.split( "[/\.]+" );
};

Rails.Route = function(){
    this.controller = null;
    this.action = "index";
};

Rails.Route.prototype.toString = function(){
    return "( Route controller:" + this.controller + " action:" + this.action + ")";
}

var RailsRoute = function( uri , options ){
    this.uri = uri;
    this.ruri = new RailsURI( uri );
    this.options = options;
};

RailsRoute.prototype.match = function( request , other ){
    if ( ! ( other && other instanceof RailsURI ) )
        return null;

    var method = request._method;
    if ( ! method )
        method = request.getMethod();

    method = method.toUpperCase();

    if ( this.options && 
         this.options.method &&
         this.options.method != method )
        return null;

    if ( other.pieces.length > this.ruri.pieces.length )
        return null;
    
    var theRoute = new Rails.Route();
    if ( this.options )
        for ( var foo in this.options )
            theRoute[foo] = this.options[foo];
    
    var max = this.ruri.pieces.length;

    for ( var i=0; i<max; i++ ){
        
        var shouldbe = this.ruri.pieces[i];
        var actuallyIs = other.pieces[i];
        
        if ( ! shouldbe.startsWith( ":" ) ){
            // this means it has to actually match
            if ( shouldbe != actuallyIs ){
                return;
            }
            continue;
        }
        
        var name = shouldbe.substring(1);
        if ( actuallyIs )
            theRoute[ name ] = actuallyIs;

        if ( this.options ){
            if ( this.options[name] instanceof RegExp ){
                if ( ! ( actuallyIs && this.options[name].matches( actuallyIs ) ) )
                    return null;
            }
        }
        
    }

    return theRoute;
};

RailsRoute.prototype.toString = function(){
    return " { " + this.uri + " " + tojson( this.options ) + " } ";
};

// --------------------------
// ---  setup callbacks -----
// --------------------------

ActionController.Routing.Routes.prototype.connect = function( r , options ){
    this.il.info( "connect : " + r  + " options [ " + tojson( options ) + "]" );
    this._routes.push( new RailsRoute( r , options ) );
};

ActionController.Routing.Routes.prototype.home = function( r , options ){
    // TODO: not sure this is correct
    this.il.error( "routes.home is probably broken" );
    //this._home = new RailsRoute( r , options );
    //this.connect( r , options );
};

ActionController.Routing.Routes.prototype.open_id_complete = function( r , options ){
    this.il.error( "routes.open_id_complete not implemented" );
};

ActionController.Routing.Routes.prototype.resource = function( r ){
    this.il.error( "routes.resource not implemented" );
};

ActionController.Routing.Routes.prototype.resources = function( r ){
    var singularName = r.substring( 0 , r.length - 1 );

    this.il.info( "resources : " + r + " [" + singularName + "]" );
    

    globals.putExplicit( r + "_path" , "/" + r );
    globals.putExplicit( r + "_url" , "/" + r );

    // new
    globals.putExplicit( "new_" + singularName + "_path" , "/" + r + "/new2" );

    // create
    this.connect( "/" + r , { controller : r , 
                              method : "POST" , 
                              action: "create" } );

    // delete
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "DELETE" , 
                                       action: "destroy" } );

    // update
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "POST" , 
                                       action: "update" } );


    // edit
    this.connect( "/" + r + "/:id/edit" , { controller : r , 
                                            action : "edit" ,
                                            id : Rails.idRegex
                                          } );
    
    globals.putExplicit( "edit_" + singularName + "_path" , 
                         function( obj ){
                             if ( ! obj )
                                 return scope[ "new_" + singularName + "_path" ];
                             return "/" + r + "/" + obj._id + "/edit";
                         } 
                       );
                         
    // show
    this.connect( "/" + r + "/:id" , { controller : r , 
                                       method : "GET" , 
                                       action : "show" ,
                                       id : Rails.idRegex
                                     } );

    this.connect( "/" + r , { controller : r ,
                              action : "index" } );
    
};

ActionController.Routing.Routes.prototype.__notFoundHandler = function( r ){
    if ( r == "_inInit" || ! this._inInit )
        return null;
    SYSOUT( r );
    var place = this.il;
    return function( name ){ 
        place.error( "ignoring method [" + r + "] name [" + name + "]" );
    }
};

// --------------------------
// ---  main  callback  -----
// --------------------------

ActionController.Routing.Routes.draw = function( f ){
    f( Rails.routes );
};

// --------------------------
// ---  runtime  -----
// --------------------------

ActionController.Routing.Routes.prototype.find = function( request ){
    var state = new RailsURI( request.getURI() );
    for ( var i=0; i<this._routes.length; i++){
        var route = this._routes[i];
        var theRoute = route.match( request , state );
        if ( ! theRoute )
            continue;
        log.ails.routes.info( "match " + route + " : " + theRoute );
        return theRoute;
    }
    return null;
};


ActionController.Routing.Routes.prototype.getLinkFor = function( thing ){
    
    if ( ! thing )
        throw "can't link to null";

    if ( isString( thing ) )
        return thing;
    
    if ( thing.collectionName )
        return "/" + thing.collectionName + "s/" + thing._id;

};
