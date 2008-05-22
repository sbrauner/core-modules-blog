// search.js

core.text.stem();
core.ext.getdefault();
core.content.html();

if ( Search && Search._doneInit )
    return;

Search = {

    log : log.search ,
    DEBUG : false ,

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
    fixTable : function(table, weights){
        if ( Search.DEBUG ) Search.log( "fixTable : " + table.getName() );
        table.ensureIndex( { _searchIndex : 1 } );
        if(weights){
            var num = [];
            Search.fixTableSub(table, weights, num);
            num = num.unique().sort().reverse();
            var a = [];
            num.forEach( function(z){
                a.push( { idx : Search.getIndexName( z ) ,
                          w : z } );
            } );
            Search._weights[ table.getName() ] = a;
        }
    },

    fixTableSub : function( table , weights , num){
        if ( weights ){
            for ( var field in weights ){

                var w = weights[ field ];
                if(typeof w == "number"){
                    num.push( w );

                    var idx = Search.getIndexName( w );
                    var o = {}
                    o[idx] = 1;

                    if ( Search.DEBUG ) Search.log( "\t putting index on " + tojson( o ) );
                    table.ensureIndex( o );
                }
                else {
                    Search.fixTableSub(table, w, num);
                }
            }


        }

    } ,

    addToIndex : function( obj, str, weight){
        var idx = Search.getIndexName( weight );

        var words = obj[idx];
        if ( !words ){
            words = [];
            obj[idx] = words;
        }

        str.split( Search.wordRegex ).forEach( function( z ){
            z = Search.cleanString( z );
            if ( z.length == 0 )
                return;
            if ( ! words.contains( z ) )
                words.add( z );
        });
    },

    index : function( obj, weights, options ){
        var keys = Object.keys(obj);
        for(var i = 0; i < keys.length; i ++){
            if(keys[i].match(/searchIndex/)) delete obj[keys[i]];
        }
        return Search.indexSub(obj, obj, weights, options);
    },

    indexSub : function( top , obj , weights, options){

        if ( weights == null )
            throw "weights can't be null";


        if( obj instanceof Array ){
            for(var i = 0; i < obj.length; i++){
                if(obj[i]){
                    if( ! (Ext.getdefault(options, 'filter', function(){return true}))(i, obj[i])) continue;
                    Search.indexSub(top, obj[i], weights, options);
                }
            }
        }

        for ( var field in weights ){

            var w = weights[field];
            var o = Ext.getdefault(options, field, {});

            if ( typeof w == "number" ){
                var s = obj[field];
                if ( ! s )
                    continue;
                if( o.stripHTML || options.stripHTML ){
                    s = content.HTML.strip(s);
                }
                if ( ! s )
                    continue;

                Search.addToIndex(top, s, w);
            }
            else {
                if( ! (Ext.getdefault(options, 'filter', function(){return true}))(field, obj[field])) return;
                Search.indexSub(top, obj[field], w, o);
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
                var res = table.find( s , { id : ObjectId() , title : true } );
                if ( options.sort )
                    res.sort( options.sort );

                while ( res.hasNext() ){
                    var tempObject = res.next();
                    var temp = tempObject._id.toString();

                    if ( matchCounts[temp] )
                        matchCounts[temp] += w;
                    else
                        matchCounts[temp] = w;

                    max = Math.max( max , matchCounts[temp] );
                    
                    if ( Search.DEBUG ) Search.log( "\t\t " + temp + "\t" + tempObject.title  + "\t" + matchCounts[temp] );
                    
                    if ( ! all.contains( temp ) )
                        all.add( temp );
                }
            } );

            if ( matchCounts.keySet().size() >= min )
                break;
        }

        if ( Search.DEBUG ){
            Search.log( "matchCounts: ");
            all.forEach( 
                function(z){
                    SYSOUT( "\t" + z + "\t" + matchCounts[z] );
                }
            );
        }

        all.sort( function( l , r ){
            var diff = matchCounts[r] - matchCounts[l];
            if ( diff != 0 )
                return diff;

            return 0;
        } );
        
        if ( Search.DEBUG ){
            Search.log( "matchCounts sorted: ");
            all.forEach( 
                function(z){
                    SYSOUT( "\t" + z + "\t" + matchCounts[z] );
                }
            );
        }

        var good = Array();
        all.forEach( function( z ){
            if ( matchCounts[z] == max || good.length < min ){
                var id = ObjectId( z );
                good.add( table.findOne( id ) );
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

    snippet: function(obj, query, weights){
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
        Search.snippetSub(obj, obj, query, weights, ary);
        return ary;
    },

    snippetSub: function(obj, parent, query, weights, results){
        // snippetSub: explore a structure recursively, as directed by
        // the weights variable.
        // The base case we're working towards is to end up with a weight
        // of a number, versus a single string.
        // In this case we just test the string.
        //
        // If we are exploring an array, we just explore each element without
        // changing the parent. This comes before the base case, because
        // we can explore arrays in either the base case or other cases.
        //
        // If we're not at an array and weights is not a number,
        // we explore recursively.
        // Don't recurse into nulls.
        var ret = false;

        if(obj == null){
            Search.log.debug("recursing onto a null object! broken weights spec??");
        }

        else if(obj instanceof Array){
            for(var i = 0; i < obj.length; i++){
                Search.snippetSub(obj[i], parent, query, weights, results);
            }
        }
        else if(typeof weights == "number"){
            // base case
            Search.log.debug("checking string : " + obj);
            if(Search.match(obj, query))
                results.push({object: parent, text: obj});
        }
        else for ( var field in weights ){
            Search.log.debug("recursive on : " + field);
            var w = weights[field];
            Search.snippetSub(obj[field], obj, query, w, results);
        }
        return ret;
    }

};

Search._doneInit = true;
Search._default.lock();
Search._default[0].setReadOnly( true );

Search.log.level = Search.log.LEVEL.ERROR;
