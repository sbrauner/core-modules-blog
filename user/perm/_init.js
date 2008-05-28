core.util.urltree();
User.Perm = Class.create(Util.URLTree, {
    initialize: function(){
        Util.URLTree.call(this);
        this.setDefault(true, {});
    },

    allowed: function(user, request){
        var r = this.apply('allowed', request.getURI(), request, user);
        return r;
    }, // fail open like allowed()

    terminal: function(end, uri, request, firstPiece, key, value, extras){
        User.Perm.log("Got a terminal " + tojson(end));
        if(isObject(end) && end.allowed) return end.allowed(user, request);
        return end;
    },

    emptyString: function(uri, request, extras){
        var user = extras;
        return this.allowed(user, request);
    },

    unwind: function(result, uri, request, firstPiece, key, value, extras){
        User.Perm.log("Unwinding " + tojson(result));
        return result;
    },
});


User.Perm.log = log.user.perm;
User.Perm.log.level = log.LEVEL.ERROR;
