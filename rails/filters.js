
var getFilterOptions = function( lst ){
    if ( ! ( lst && lst.length ) )
        return {};

    var options = {};
    if ( isObject( lst[ lst.length - 1 ] ) )
        options = lst.pop();
    
    return options;
}

Rails.Filter = function( filter , options ){
    this.filter = filter;
    this.options = options || {};
}

Rails.Filter.prototype.skip = function( route ){
    if ( this.options.except && this.options.except.contains( route.action ) )
        return true;
    
    if ( this.options.only && ! this.options.only.contains( route.action ) )
        return true;
    
    return false;
}

Rails.Filter.prototype.toString = function(){
    return this.filter;
}

before_filter = function(){
    
    options = getFilterOptions( arguments );

    if ( ! this.keySet().contains( "beforeFilters" ) ){
        var old = this.beforeFilters;
        this.beforeFilters = [];
        this.beforeFilters._prev = old;
    }
    
    for ( var i=0; i<arguments.length; i++ ){
        var f = new Rails.Filter( arguments[i] , options );
        log.rails.init.beforeFilter.info( "added [" + f + "]" );
        this.beforeFilters.add( f );
    }
};

ActionController.Base.prototype._before = function( appResponse ){
    
    if ( ! this.beforeFilters )
        return;
    
    var a = this.beforeFilters;
    
    while ( a ){
        for ( var i=0; i<a.length; i++ ){
            var filter = a[i];
            var name = filter.filter;
            var options = filter.options;
            var f = a[i];
            
            log.rails.beforeFilter[this.shortName].info( "running before filter [" + filter + "]" );
            
            if ( isString( name ) ){
                f = appResponse.requestThis[name];
            }
            
            if ( ! isFunction( f ) ){
                SYSOUT( "skipping before filter [" + filter + "] " );
                continue;
            }
            
            if ( filter.skip( matchingRoute ) )
                continue;

            f.call( appResponse.requestThis );
        }
        a = a._prev;
    }

}
