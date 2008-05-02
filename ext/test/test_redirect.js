core.ext.redirect();

var assertThrows = function(f){
    var exc = null;
    try{
        f();
    }
    catch(e){
        exc = e;
    }
    assert(exc);
};

assertThrows(function(){ Ext.redirect(null); });

var out = Ext.redirect(function(){
    print("Hi");
    return 4;
});

assert(out.output == "Hi");
assert(out.value == 4);

assertThrows(function(){
    Ext.redirect(function(){
        throw "Hi";
    });
});

var out = Ext.redirect(function(){
    print("Yo");
    // no return
});

assert(out.output == "Yo");
assert(!out.value);
