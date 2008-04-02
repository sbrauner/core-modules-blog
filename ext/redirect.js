Ext.redirect = function(f){
    // Is there a better way to return this stuff to the user? Not sure.
    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    var value = f();
    print = oldPrint;
    return {value: value, output: buf};
};

