// routes.js

/**

for usage, for now look ad corejs/core/test/test_routes

==basics==
* keys are urls
** routes.wiki
*** matches /wiki/
** routes.wiki.abc
*** /wiki/abc

* value are path to jxp
** if starts with / its absolute
** otherwise relative

<prenh>
routes.wiki.search = "/wiki/doSearch";
</prenh>
is equivlant to
<prenh>
routes.wiki.search = "doSearch";
</prenh>

== regex ==
<prenh>
* routes.add( /abc/ , "" )
* routes.add( /abc(\d)/ , "/foo/$0/$1
</prenh>



*/

// FIXME: add an setBase method, which means, "all my children live at (e.g.)
//    /~~/user, so if you got to one of my children, replace how you got to me
// with /~~/user".

Routes = function(){
    this._regexp = [];
    this._default = null;
};

Routes.log = log.routes;
Routes.log.level = log.LEVEL.INFO;

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

/**
* returns the root at which the last sub-routes took over
*/
Routes.prototype.currentRoot = function(){
    return currentRoot;
};

Routes.prototype.apply = function( uri , request , response ){

    Routes.log.debug( "apply\t" + uri );

    if ( uri == "" ){
        var nu = request.getURI() + "/";
        if ( request.getQueryString()  )
            nu += "?" + request.getQueryString();
        response.sendRedirectTemporary( nu );
    }

    if ( ! uri.startsWith( "/" ) )
        uri = "/" + uri;

    var firstPiece = uri.replace( /^\/?([^\/\\\?&=#]+)\b.*/ , "$1" );

    // currentRoot stuff
    if ( true ) {

        if ( ! currentRoot )
            currentRoot = "";

        if ( lastPiece ){
            currentRoot += "/" + lastPiece;
        }

        lastPiece = firstPiece;
    }


    for ( var key in this ){

        if ( key.startsWith( "_" ) )
            continue;

        if ( key == firstPiece )
            return this.finish( uri , request , response , firstPiece , key , this[ key ] );
    }

    if(firstPiece.substring( 0 , firstPiece.indexOf('.') ) in this){
        key = firstPiece.substring( 0, firstPiece.indexOf('.'));
        return this.finish(uri , request , response , firstPiece, key, this[key]);
    }

    for ( var i=0; i<this._regexp.length; i++ ){
        var value = this._regexp[i];
        if ( value.key.test( uri ) )
            return this.finish( uri , request , response , firstPiece , value.key , value );
    }

    Routes.log.debug( "\t using default\t" + this._default );
    return this.finish( uri , request , response , firstPiece , null , this._default );
};

Routes.prototype.finish = function( uri , request , response , firstPiece , key , value ){
    if ( ! value )
        return null;

    var end = value;
    if ( isObject( end ) && end.isValue )
        end = value.end;

    if ( ! end )
        return null;

    if ( isString( end ) ){

        if ( key instanceof RegExp ){
            end = uri.replace( key , end );

            if ( value.attachment && value.attachment.names ){

                var names = value.attachment.names;
                var r = key.exec( uri );

                if ( ! r )
                    throw "something is wrong";

                for ( var i=0; i<names.length; i++ ){
                    if ( r[i+1] )
                        request[ names[i] ] = r[i+1];
                }

            }
        }

        return end;
    }

    if ( isObject( end ) && end.apply ){
        var res = end.apply( uri.substring( 1 + firstPiece.length ) , request , response ) || "";
        if ( ! ( res && res.startsWith( "/" ) ) )
            res =  "/" + firstPiece + "/" + res;
        res = res.replace( /\/+/g , "/" );
        return res;
    }

    throw "can't handle value: " + end;
};

Routes.prototype.find = function(submodule){
    if(this == submodule) return '/';
    for(var key in this){
        if( key.startsWith( "_" ) )
            continue;
        if(this[key] == null){
            log.warn("Invalid route : " + key);
            continue;
        }

        if(this[key] == submodule){
            return '/' + key;
        }
        if(isObject(this.getEnd(this[key]))){
            var f = this.getEnd(this[key]).find(submodule);
            if(f)
                return '/' + key + f;
        }
    }

    // Regexps??  ---
    for(var i = 0; i < this._regexp.length; i++){
        var value = this._regexp[i];
        if ( isObject(value.end) && value.end.find(submodule) )
            throw "find returned regex -- help!!";
    }
    return null;
};

Routes.prototype.getEnd = function(obj){
    if(obj.isValue) return obj.end;
    return obj;
};
