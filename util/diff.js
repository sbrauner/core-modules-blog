
Diff = {

    diffStr : function( a , b ){
        return javaStatic( "ed.util.DiffUtil" , "computeDiff" , a , b );
    } ,

    applyBackwardsStr : function( base , diff ){
        return javaStatic( "ed.util.DiffUtil" , "applyScript" , base , diff );
    } ,

    // diff(3, 5) -> 2
    // applyBackwards(5, 2) -> 3

    diffInt : function( a , b ){
        return b-a;
    } ,

    applyBackwardsInt : function( base, diff ){
        return base-diff;
    } ,

    // diffDate takes Date, Date -> number
    diffDate : function( a , b ){
        return b.getTime() - a.getTime();
    },

    // applyBackwardsDate takes Date, number -> Date
    applyBackwardsDate : function( base, diff ){
        return new Date(base.getTime() - diff);
    },

    test : function(){
        var a = "1\n2";
        var b = "1\n3";

        var d = Diff.diffStr( a , b );
        var n = Diff.applyBackwardsStr( b , d );

        assert( a == n );

        var a = 3;
        var b = 5;
        var d = Diff.diffInt( a , b );
        var n = Diff.applyBackwardsInt( b , d );

        assert( a == n );

        var a = new Date( 2008, 01, 03, 7, 30, 0, 0 );
        var b = new Date( 2008, 01, 04, 7, 30, 0, 0 );
        var d = Diff.diffDate( a , b );
        var n = Diff.applyBackwardsDate( b, d );

        assert( a == n );

        return true;
    },

    diffArray : function( a , b ){
        // This is really hard!
        // OK, start with the simplest cases:
        // An array of a strings vs another array of strings.
        // We can't just join the strings with newlines and pass it to the
        // underlying string method..
        // In this case we should probably expose more of the underlying bmsi diff
        // code. Pass the arrays of strings "a", "b", "d" and "a", "b", "c", "d"
        // and hope it does the right thing -- try to insert a c.
        // I'm concerned that it always pick the "smallest" when it comes to
        // inserting elements.
        // An array of ints could be tricky too, especially when it comes to insert
        // them.
        // Arrays of objects are really hairy. I guess maybe come up with a
        // "distance" metric? I'd really have to look at the actual diff code

        // For now, throw an exception and hope it never happens.
        throw new Exception("diff on array not supported");
    },

    applyBackwardsArray : function( base , diff ){
        throw new Exception("how did you get a diff on an array??");
    },

    // Note: these functions are totally incomplete

    diffObj : function( a , b ){
        var d = {};
        for(var prop in a){
            if(! b[prop]){
                // mark it as removed
            }

            if(typeof a[prop] == "number" && typeof b[prop] == "number"){
                d[prop] = Diff.diffInt(a[prop], b[prop]);
            }
            else if(typeof a[prop] == "string" && typeof b[prop] == "string"){
                d[prop] = Diff.diffString(a[prop], b[prop]);
            }
        }
        for(var prop in b){
            if(! a[prop]){
                // add it
            }
        }
    },

    applyBackwardsObj : function( base , diff ){
        var res = {};
        for(var prop in base){
            res[prop] = base[prop];
        }
        for(var prop in diff){
            if(typeof base[prop] == "number")
                res[prop] = Diff.applyBackwardsInt(base[prop], diff[prop]);
        }
    }
};
