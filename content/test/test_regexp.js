core.content.regexp();

content.RegExp.special.forEach(function(s){
    if(s.match(new RegExp("^" + content.RegExp.escape(s) + "$")))
        return;
    print(s + " didn't match ^" + content.RegExp.escape(s) + "$")
    assert(false);
});
