// search.js

core.text.stem();

if ( Search && Search._doneInit )
    return;

Search = {

    DEBUG : true ,

    _weights : {} ,
    _default : [ { idx : "_searchIndex" , w : 1 } ] ,

    wordRegex : /[,\. ]*\b[,\. ]*/ ,

    cleanString : function( s ){
        s = s.trim().toLowerCase();
        s = Stem.stem( s );
        s = s.trim();
        return s;
    } ,

    getIndexName : function( weight ){
        var idx = "_searchIndex";
        if ( weight && weight > 0 && weight != 1 )
            idx += "_" + weight;
        return idx;
    } ,

    fixTable : function( table , weights ){
        if ( Search.DEBUG ) SYSOUT( "fixTable : " + table.getName() );
        table.ensureIndex( { _searchIndex : 1 } );

        if ( weights && weights.length > 0 ){

            var num = [];

            for ( var field in weights ){

                var w = weights[ field ];
                num.push( w );

                var idx = Search.getIndexName( w );
                var o = {}
                o[idx] = 1;

                if ( Search.DEBUG ) SYSOUT( "\t putting index on " + tojson( o ) );
                table.ensureIndex( o );
            }

            num = num.unique().sort().reverse();
            var a = [];
            num.forEach( function(z){
                    a.push( { idx : Search.getIndexName( z ) ,
                                w : z } );
                } );
            Search._weights[ table.getName() ] = a;

        }

    } ,

    index : function( obj , weights ){

        if ( weights == null )
            throw "weights can't be null";

        for ( var field in weights ){

            var s = obj[field];
            if ( ! s )
                continue;

            var idx = Search.getIndexName( weights[field] );

            var words = obj[idx];
            if ( ! words ){
                words = [];
                obj[idx] = words;
            }

            s.split( Search.wordRegex ).forEach( function( z ){
                    z = Search.cleanString( z );
                    if ( z.length == 0 )
                        return;
                    if ( ! words.contains( z ) )
                        words.add( z );
                } );

        }

        return obj;
    } ,

    search : function( table , queryString , options ){

        if ( Search.DEBUG ) SYSOUT( table.getName() + "\t" + queryString );

        options = options || {};
        var min = options.min || 10;

        var weights = Search._weights[ table.getName() ] || Search._default;
        if ( weights.length == 0 )
            weights = Search._default;
        if ( weights.length == 0 )
            weights.push( { idx : "_searchIndex" , w : 1 } );
        if ( Search.DEBUG ) SYSOUT( "\t weights.length : " + weights.length );


        var fullObjects = Object();
        var matchCounts = Object(); // _id -> num
        var all = Array();
        var max = 0;

        var words = [];
        queryString.split( Search.wordRegex ).forEach( function( z ){
                z = Search.cleanString( z );
                if ( z.length == 0 )
                    return;
                words.push( z );
            } );
        words = words.unique();

        for ( var i=0; i<weights.length; i++){
            var idx = weights[i].idx;
            var w = weights[i].w;

            if ( Search.DEBUG ) SYSOUT( "\t using index " + idx );

            words.forEach( function(z){
                    if ( Search.DEBUG ) SYSOUT( "\t\t searching on word [" + z + "]" );
                    var s = {}; s[idx] = z;
                    var res = table.find( s );

                    while ( res.hasNext() ){
                        var tempObject = res.next();
                        var temp = tempObject._id.toString();

                        if ( matchCounts[temp] )
                            matchCounts[temp] += w;
                        else
                            matchCounts[temp] = w;

                        max = Math.max( max , matchCounts[temp] );

                        if ( Search.DEBUG ) SYSOUT( "\t\t " + temp + "\t" + tempObject.title );

                        fullObjects[temp] = tempObject;
                        if ( ! all.contains( temp ) )
                            all.add( temp );
                    }
                } );

            if ( matchCounts.keySet().size() >= min )
                break;
        }

        if ( Search.DEBUG ) SYSOUT( "matchCounts: " + tojson( matchCounts ) );

        all.sort( function( l , r ){
                return matchCounts[r] - matchCounts[l];
            } );

        var good = Array();
        all.forEach( function( z ){
                if ( matchCounts[z] == max || good.length < min ){
                    good.add( fullObjects[z] );
                    return;
                }
            } );

        return good;
    }
};

Search._doneInit = true;
Search._default.lock();
Search._default[0].setReadOnly( true );

