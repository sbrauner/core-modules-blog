var djang10 = core.templates.djang10();

register = new djang10.Library();

register.filter("myRev", function(value, param) {
    log("myRev: [value="+value+"],[param="+param+"]" );
    return value.reverse() + ":" + param;
});

