
ActionController = {};

ActionController.Routing = {};

ActionController.Routing.Routes = function(){
    
};

ActionController.Routing.Routes.prototype.connect = function( r ){
    SYSOUT( "connect : " + r );
};

ActionController.Routing.Routes.prototype.resources = function( r ){
    SYSOUT( "resource : " + r );
};

ActionController.Routing.Routes.draw = function( f ){
    f( Rails.routes );
};
