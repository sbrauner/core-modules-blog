Ext.asString = function(f, sendReturnValue){
    // FIXME: Should there even be an option to get the return value?
    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    var value = f();
    print = oldPrint;
    if(! sendReturnValue)
        return buf.trim();
    else
        return {retval: value, output: buf};
};
