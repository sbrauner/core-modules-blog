// search.js

core.text.stem();

Search = { 
    
    wordRegex : /[,\. ]*\b[,\. ]*/ ,

    cleanString : function( s ){
        s = s.trim().toLowerCase();
        s = Stem.stem( s );
        s = s.trim();
        return s;
    } ,

    fixTable : function( table ){
        table.ensureIndex( { _index : 1 } );
    } ,

    index : function( obj , weights ){
        
        var words = Array();
        
        for ( var field in weights ){

            var s = obj[field];
            if ( ! s )
                continue;
            
            s.split( Search.wordRegex ).forEach( function( z ){ 
                    z = Search.cleanString( z );
                    if ( z.length == 0 ) 
                        return;
                    if ( ! words.contains( z ) )
                        words.add( z );
                } );
            
        }
        
        obj._searchIndex = words;
        
        return obj;
    } ,

    search : function( table , queryString ){
        
        var matchCounts = Object(); // _id -> num
        var all = Array();
        var max = 0;

        queryString.split( Search.wordRegex ).forEach( function( z ){
                z = Search.cleanString( z );                
                if ( z.length == 0 )
                    return;
                
                var res = table.find( { _searchIndex : z } , { _id : CrID() , _searchIndex : true }  );
                
                while ( res.hasNext() ){
                    var temp = res.next()._id.toString();
                    
                    if ( matchCounts[temp] )
                        matchCounts[temp]++;
                    else
                        matchCounts[temp] = 1;

                    max = Math.max( max , matchCounts[temp] );

                    if ( ! all.contains( temp ) )
                        all.add( temp );
                }
            } );
        
        all.sort( function( l , r ){ 
                return matchCounts[r] - matchCounts[l];
            } );
        
        var good = Array();
        all.forEach( function( z ){
                if ( matchCounts[z] == max ){
                    good.add( table.find( z ) );
                    return;
                }
            } );
        
        return good;
    }
}
