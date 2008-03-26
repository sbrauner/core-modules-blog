Ext.asString = function(f, args){
    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    f.apply(null, args);
    print = oldPrint;
    return buf.trim();
};
