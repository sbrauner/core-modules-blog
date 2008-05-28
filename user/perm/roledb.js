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
