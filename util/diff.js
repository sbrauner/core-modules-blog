Util.Diff = {

    diffStr : function( a , b ){
        if(a == b) return "";
        // you need a '+""' at the end to convert it from a "native_string" to a "string"
        var x= javaStatic( "ed.util.DiffUtil" , "computeDiff" , a , b )+"";
        return x;
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

        var d = Util.Diff.diffStr( a , b );
        var n = Util.Diff.applyBackwardsStr( b , d );

        assert( a == n );

        var a = 3;
        var b = 5;
        var d = Util.Diff.diffInt( a , b );
        var n = Util.Diff.applyBackwardsInt( b , d );

        assert( a == n );

        var a = new Date( 2008, 01, 03, 7, 30, 0, 0 );
        var b = new Date( 2008, 01, 04, 7, 30, 0, 0 );
        var d = Util.Diff.diffDate( a , b );
        var n = Util.Diff.applyBackwardsDate( b, d );

        assert( a == n );

        return true;
    },

    diffArray : function( a , b ){
        // if we are comparing the same array to itself, we need to make a copy
        // so that we aren't unshifting it twice
        if(a == b) {
            b = Object.extend([], a);
        }

        var dArr = [];
        c = [];
        a.unshift();
        b.unshift();
        for(var i in a) {
            c[i] = [];
            c[i][0] = 0;
        }
        for(var j=1; j< b.length; j++) {
            c[0][j] = 0;
        }
        for(var i=1; i< a.length; i++) {
            for(var j=1; j< b.length; j++) {
                var obj = Util.Diff.diff(a[i], b[j]);
                if(obj == null || !c || !c[i-1] || !c[i]) {
                    return ["oops, something went wrong diffing the array."];
                }
                if ( Object.keys(obj).length == 0)
                    c[i][j] = c[i-1][j-1] + 1;
                else
                    c[i][j] = Math.max(c[i][j-1], c[i-1][j]);
            }
        }

        function printDiff(c, x, y, i, j) {
            if (i > 0 && j > 0 && x[i] == y[j]) {
                printDiff(c, x, y, i-1, j-1);
            }
            else {
                if (j > 0 && (i == 0 || (i > 0 && j > 0 && c[i][j-1] >= c[i-1][j]))) {
                    printDiff(c, x, y, i, j-1);
                    dArr.push({ add : y[j]});
                }
                else if (i > 0 && (j == 0 || ( i > 0 && j > 0 && c[i][j-1] < c[i-1][j]))) {
                    printDiff(c, x, y, i-1, j);
                    dArr.push({ remove : x[i] });
                }
            }
        }
        printDiff(c, a, b, a.length-1, b.length-1);
        a.shift();
        b.shift();
        return dArr;

    },

    applyBackwardsArray : function( base , diff ){
        throw new Exception("how did you get a diff on an array??");
    },

    diffBool : function( a, b ) {
        if(a == b) return 0;
        return { add : a, remove: b};
    },

    diffObj : function( a , b ){
        var d = {};
        var valid_type = ["string", "number", "boolean", "objectid"];
        var valid_instance = ["Array", "Object", "Date"];
        for(var prop in a){
            if(! (prop in b) ){
                // mark it as removed
                d[prop] = {remove: a[prop]};
            }
            else if(typeof a[prop] == typeof b[prop] && valid_type.contains(typeof a[prop])){
                var diffy = Util.Diff.diffFunc[typeof a[prop]](a[prop], b[prop]);
                if(diffy && ((typeof diffy == "number" && diffy != 0)
                             || (typeof diffy == "string" && diffy != "")
                             || (typeof diffy == "object" && Object.keys(diffy).length > 0)
                            )) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Date && b[prop] instanceof Date) {
                var diffy = Util.Diff.diffFunc["Date"](a[prop], b[prop]);
                if(diffy && diffy != 0) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Array && b[prop] instanceof Array) {
                var diffy = Util.Diff.diffFunc["Array"](a[prop], b[prop]);
                if(diffy instanceof Array && diffy.length > 0) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Object && b[prop] instanceof Object) {
                var diffy = Util.Diff.diffFunc["Object"](a[prop], b[prop]);
                if(diffy instanceof Object && Object.keys(diffy).length > 0) {
                    d[prop] = {change: diffy};
                }
            }
            else {
                log.diff.warning("property " + prop + " is of different types in the two objects");
                d[prop] = {change: {remove: a[prop], add: b[prop]}};
            }
        }
        for(var prop in b){
            if(! (prop in a) ){
                // add it
                d[prop] = {add: b[prop]};
            }
        }
        return d;
    },

    applyBackwardsObj : function( base , diff ){
        var res = {};
        for(var prop in base){
            res[prop] = base[prop];
        }
        for(var prop in diff){
            var d = diff[prop];
            if(d.add){
                // apply backwards, i.e. delete it
                delete res[prop];
            }
            if(d.remove){
                // apply backwards, i.e. add it
                res[prop] = d.remove;
            }
            if(d.change){
                if(typeof base[prop] == "number"){
                    res[prop] = Util.Diff.applyBackwardsInt(base[prop], diff[prop].change);
                }
                else if(typeof base[prop] == "string"){
                    res[prop] = Util.Diff.applyBackwardsStr(base[prop], diff[prop].change);
                }
                else{
                    throw new Exception("not implemented, leave me alone");
                }

            }
        }
        return res;
    },

    diff : function(a, b){
        var diffy = Util.Diff.diffObj({arg: a}, {arg: b})["arg"];
        if(!diffy) return {};
        else if(diffy.change) return diffy.change;
        else return diffy;
    },

    applyBackwards : function(base, diff){
        return Util.Diff.applyBackwardsObj({arg: base}, {arg: {change: diff}})["arg"];
    },

};

Util.Diff.diffFunc = { "string" : Util.Diff.diffStr,
                       "number" : Util.Diff.diffInt,
                       "boolean" : Util.Diff.diffBool,
                       "objectid" : Util.Diff.diffBool,
                       "Object" : Util.Diff.diffObj,
                       "Array" : Util.Diff.diffArray,
                       "Date" : Util.Diff.diffDate
                     };



