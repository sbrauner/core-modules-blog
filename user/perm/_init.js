core.util.urltree();
User.Perm = Class.create(Util.URLTree, {
    initialize: function(args){
        Util.URLTree.call(this);
        var def = true;
        if(args.closed) def = false;
        this.setDefault(def, {});
    },

    allowed: function(user, request, uri){
        if(uri == null) uri = request.getURI();
        var recursefunc = function(next, uri, request, extras){
            return next.allowed(user, request, uri);
        };
        var r = this.apply(recursefunc, uri, request, user);
        return r;
    }, // fail open like allowed()

    canRecurse: function(next){ return next.allowed; },

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
