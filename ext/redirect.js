Ext.redirect = function(f){
    // Is there a better way to return this stuff to the user? Not sure.
    if(! f) throw "cannot call a null function";

    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    try {
        var value = f();
    }
    finally {
        print = oldPrint;
    }
    return {value: value, output: buf};
};

