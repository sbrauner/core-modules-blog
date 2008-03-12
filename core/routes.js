// routes.js

/**
* for usage, for now look ad corejs/core/test/test_routes
*/

Routes = function(){
    this._regexp = [];
    this._default = null;
};

// setting up

Routes.prototype.add = function( key , end , attachment){
    var value = this._createValue( key , end , attachment );
    
    if ( isString( key ) ){
        this[ key ] = value;
        return;
    }

    if ( key instanceof RegExp ){
        this._regexp.push( value );
        return;
    }
    
    throw "can't handle : " + key;
};

Routes.prototype.setDefault = function( end , attachment ){
    this._default = this._createValue( null , end , attachment );
};

Routes.prototype._createValue = function( key , end , attachment ){
    return {
        isValue : true ,
        key : key ,
        end : end , 
        attachment : attachment };
}

// main public method

Routes.prototype.apply = function( uri , request ){
    if ( ! uri.startsWith( "/" ) )
        uri = "/" + uri;

    var firstPiece = uri.replace( /^\/?(\w+)\b.*/ , "$1" );
    
    for ( var key in this ){
        
        if ( key.startsWith( "_" ) )
            continue;

        if ( key == firstPiece )
            return this.finish( uri , request , firstPiece , key , this[ key ] );
    }

    for ( var i=0; i<this._regexp.length; i++ ){
        var value = this._regexp[i];
        if ( value.key.test( uri ) )
            return this.finish( uri , request , firstPiece , value.key , value );
    }
    
    return this.finish( uri , request , firstPiece , null , this._default );
};

Routes.prototype.finish = function( uri , request , firstPiece , key , value ){
    if ( ! value )
        return null;
    
    var end = value;
    if ( isObject( end ) && end.isValue )
        end = value.end;
    
    if ( ! end )
        return null;
    
    if ( isString( end ) ){

        if ( end.indexOf( "$" ) < 0 )
            return end;

        if ( key instanceof RegExp )
            end = uri.replace( key , end );

        return end;
    }
    
    if ( isObject( end ) && end.apply ){
        var res = end.apply( uri.substring( 1 + firstPiece.length ) ) || "";
        if ( res && res.startsWith( "/" ) )
            return res;
        return "/" + firstPiece + "/" + res;
    }
    
    throw "can't handle value: " + end;
};

