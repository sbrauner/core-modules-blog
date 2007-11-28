// search.js

function index( obj , weights ){

    var words = Array();

    for ( var field in weights ){
        print( "going to weight " + field + " with " + weights[field] );
        
        var s = obj[field];
        if ( ! s )
            continue;
        
        s.split( /[,\. ]*\b[,\. ]*/ ).forEach( function( z ){ 
                z = z.trim();
                if ( z.length == 0 ) 
                    return;
                z = Stem.stem( z );
                if ( ! words.contains( z ) )
                    words.add( z );
            } );
        
    }

    obj._searchIndex = words;
}
