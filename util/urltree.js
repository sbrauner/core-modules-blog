Util.URLTree = function(){
    this._regexp = [];
    this._default = null;
};

Util.URLTree.log = log.urltree;
Util.URLTree.log.level = log.LEVEL.ERROR;

Object.extend(Util.URLTree.prototype, {
    add: function( key , end , attachment ){
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
    },

    setDefault: function( end , attachment ){
        this._default = this._createValue( null , end , attachment );
    },

    _createValue: function( key , end , attachment ){
        return {
            isValue : true,
            key : key,
            end : end,
            attachment : attachment };
    },

    getEnd: function(obj){
        if(obj.isValue) return obj.end;
        return obj;
    },

    apply: function( recurse , uri , request , extras ){
        Util.URLTree.log.debug( "apply\t" + uri );
        if ( uri == "" )
            return this.emptyString( uri, request , extras );

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
                return this.finish( recurse , uri , request , firstPiece , key, this[ key ] , extras );
        }

        if(firstPiece.substring( 0, firstPiece.indexOf('.') ) in this){
            key = firstPiece.substring( 0, firstPiece.indexOf('.'));
            return this.finish(recurse, uri, request, firstPiece, key, this[key], extras);
        }

        for(var i = 0; i < this._regexp.length; i++){
            var value = this._regexp[i];
            if ( value.key.test( uri ) )
                return this.finish( recurse, uri, request, firstPiece, value.key, value, extras);
        }

        Util.URLTree.log.debug( "\t using default\t" + this._default );
        return this.finish( recurse, uri , request , firstPiece , null , this._default , extras );
    },

    /**
     * find: locate the path of a submodule in this URLTree
     * @returns a String
     */
    find: function(submodule){
        if(this == submodule) return '/';
        for(var key in this){
            if( key.startsWith( "_" ) )
                continue;

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
    },

    finish: function( recurse, uri, request , firstPiece , key , value , extras ){
        if(! recurse) recurse = function(end, uri, request, extras){ return end.apply(null, uri, request, extras); };
        var end = value;
        if ( isObject( end ) && end.isValue )
            end = value.end;

        if ( isObject( end ) ){
            Util.URLTree.log.debug("Recursing on end");
            var res = recurse( end, uri.substring( 1 + firstPiece.length ) , request , extras );
            if(res == null) res = this.getDefault();
            res = this.unwind( res, uri, request, firstPiece, key, value, extras);
            return res;
        }

        else {
            Util.URLTree.log.debug("Found a terminal");
            return this.terminal( end, uri , request, firstPiece, key, value, extras );
        }

        throw "can't handle value: " + end;
    },

    // This is mostly routes-specific. FIXME: Move this into a subclass
    currentRoot: function(){
        return currentRoot;
    },

    getDefault: function(){
        return "";
    },

    emptyString: function(uri, request, extras){
        response = extras[0];
        var nu = request.getURI() + "/";
        if( request.getQueryString() )
            nu += "?" + request.getQueryString();
        response.sendRedirectTemporary( nu );
    },

    terminal: function( end, uri, request, firstPiece, key, value, extras){
        if ( key instanceof RegExp ){
            end = uri.replace( key , end );
            if ( value.attachment && value.attachment.names ){

                var names = value.attachment.names;
                var r = key.exec( uri );

                if ( ! r )
                    throw "something is wrong";

                for ( var i=0; i<names.length; i++){
                    if ( r[i+1] )
                        request[ names[i] ] = r[i+1];
                }

            }
        }
        return end;
    },

    unwind: function( result, uri, request, firstPiece, key, value, extras ){
        if ( ! ( res && res.startsWith( "/" ) ) )
            res = "/" + firstPiece + "/" + res;
        res = res.replace( /\/+/g , "/" );
        return res;
    },
});
