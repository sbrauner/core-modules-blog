// FIXME: currently, if a user doesn't have permission to access something, but
// there's a child permission object that grants permission to the same thing,
// permission will be granted. I don't know if this is the corrcet behavior 
// or not.

// Similarly, if this class has a role that grants permission to something,
// child permissions aren't even consulted (even if they deny access to that 
// thing).
User.Perm.RoleDB = Class.create(User.Perm, {
        initialize: function($super, collection){
            $super();
            this._collection = collection;
            this.setDefault(false, {});
        },
    
        allowed: function($super, user, request, uri){
            if(! uri) uri = request.getURI();
            var perm = false;
            if(user.permissions){
                var t = this;
                perm = user.permissions.some(function(p){
                        var role = t._collection.findOne({name: p});
                        if(! role) return false;
                        
                        return role.urls.some(function(r){
                                log(r + " " + uri);
                                return new RegExp(r).match(uri);
                            });
                        
                    });
            }
            if(perm) return perm;
            return $super(user, request, uri);
        },
    });
