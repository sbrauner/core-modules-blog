Ext.asString = function(f){
    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    f();
    print = oldPrint;
    return buf.trim();
};
