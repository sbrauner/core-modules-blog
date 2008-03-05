// search.js

core.text.stem();

if ( Search && Search._doneInit )
    return;

Search = {

    log : log.search ,
    DEBUG : true ,

    _weights : {} ,
    _default : [ { idx : "_searchIndex" , w : 1 } ] ,

    wordRegex : /[,\. ]*\b[,\. ]*/ ,

    cleanString : function( s ){

        if ( ! s.match( /\w/ ) )
            return "";

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

    // make sure that all indexes are on the right fields of the table
    fixTable : function( table , weights ){
        if ( Search.DEBUG ) Search.log( "fixTable : " + table.getName() );
        table.ensureIndex( { _searchIndex : 1 } );

        if ( weights ){
            var num = [];

            for ( var field in weights ){

                var w = weights[ field ];
                num.push( w );

                var idx = Search.getIndexName( w );
                var o = {}
                o[idx] = 1;

                if ( Search.DEBUG ) Search.log( "\t putting index on " + tojson( o ) );
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

    index : function( obj, weights ){
        return Search.indexSub(obj, obj, weights);
    },

    indexSub : function( top , obj , weights ){

        if ( weights == null )
            throw "weights can't be null";

        if( obj instanceof Array ){
            for(var i = 0; i < obj.length; i++){
                Search.indexSub(top, obj[i], weights);
            }
        }

        for ( var field in weights ){

            var w = weights[field];

            if ( typeof w == "number" ){
                var idx = Search.getIndexName( weights[field] );

                var words = top[idx];
                if ( ! words ){
                    words = [];
                    top[idx] = words;
                }

                var s = obj[field];
                if ( ! s )
                    continue;

                s.split( Search.wordRegex ).forEach( function( z ){
                    z = Search.cleanString( z );
                    if ( z.length == 0 )
                        return;
                    if ( ! words.contains( z ) )
                        words.add( z );
                });
            }
            else {
                Search.indexSub(top, obj[field], w);
            }

        }

        return top;
    } ,

    queryToArray : function(queryString){

        var words = [];
        queryString.split( Search.wordRegex ).forEach( function( z ){
                z = Search.cleanString( z );
                if ( z.length == 0 )
                    return;
                words.push( z );
            } );
        words = words.unique();
        return words;
    },

    search : function( table , queryString , options ){

        if ( Search.DEBUG ) Search.log( table.getName() + "\t" + queryString );

        options = options || {};
        var min = options.min || 10;

        var weights = Search._weights[ table.getName() ] || Search._default;
        if ( weights.length == 0 )
            weights = Search._default;
        if ( weights.length == 0 )
            weights.push( { idx : "_searchIndex" , w : 1 } );
        if ( Search.DEBUG ) Search.log( "\t weights.length : " + weights.length );

        var fullObjects = Object();
        var matchCounts = Object(); // _id -> num
        var all = Array();
        var max = 0;
        var words = Search.queryToArray(queryString);

        for ( var i=0; i<weights.length; i++){
            var idx = weights[i].idx;
            var w = weights[i].w;

            if ( Search.DEBUG ) Search.log( "\t using index " + idx );

            words.forEach( function(z){
                    if ( Search.DEBUG ) Search.log( "\t\t searching on word [" + z + "]" );
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

                        if ( Search.DEBUG ) Search.log( "\t\t " + temp + "\t" + tempObject.title );

                        fullObjects[temp] = tempObject;
                        if ( ! all.contains( temp ) )
                            all.add( temp );
                    }
                } );

            if ( matchCounts.keySet().size() >= min )
                break;
        }

        if ( Search.DEBUG ) Search.log( "matchCounts: " + tojson( matchCounts ) );

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
    },

    match: function(obj, query){
        var qwords = Search.queryToArray(query);
        var owords = Search.queryToArray(obj);
        for(var i = 0; i < qwords.length; i++){
            if(owords.contains(qwords[i]))
                return true;
        }
    },

    snippet: function(obj, query){
        // snippet: given an object and a search term, find the relevant parts
        // of the object.
        //
        // FIXME: Which parts are relevant? For right now, I only return
        // JS objects.
        // So, if given: {a : ["hi", "yo", "hey"]} and the query "hi", return
        // the whole object -- not the array, not either of the strings.
        // Search.snippet should return an array of {object: o1, text: "hi"}
        // objects.
        // Other text processing can happen after that. snippet should
        // just search through the object structure to find the text at all

        var ary = [];
        Search.snippetSub(obj, obj, query, ary);
        return ary;
    },

    snippetSub: function(obj, parent, query, results){
        // snippetSub
        var ret = false;
        if(typeof obj == "string"){
            Search.log.debug("checking string : " + obj);
            if(Search.match(obj, query))
                results.push({object: parent, text: obj});
        }
        else if(obj instanceof Array){
            // array
            Search.log.debug("recursing on array");
            for(var i = 0; i < obj.length; i++){
                Search.log.debug("number : " + i);
                Search.log.debug("value : " + obj[i]);
                Search.snippetSub(obj[i], parent, query, results);
            }
        }
        else {
            // object
            Search.log.debug("recursing on object");
            for(var field in obj){
                Search.log.debug("field : " + field);
                var val = obj[field];
                Search.log.debug("value : " + val);
                Search.snippetSub(val, obj, query, results);
            }
        }
        return ret;
    }

};

Search._doneInit = true;
Search._default.lock();
Search._default[0].setReadOnly( true );

