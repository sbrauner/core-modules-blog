
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

    diffObj : function( a , b ){

    }
};
