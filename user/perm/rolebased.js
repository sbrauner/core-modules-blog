User.Perm.RoleBased = Class.create(User.Perm, {
        initialize: function($super){
            $super();
            this.setDefault(false, {});
        },
        // See note in roledb
        allowed: function($super, user, request, uri){
            if(! uri) uri = request.getURI();
            var perm = false;
            if(user.permissions){
                var t = this;
                perm = user.permissions.some(function(p){
                        var urls = t.getRoleURLs(p);
                        if(! urls) return false;
                        
                        return urls.some(function(r){
                                return new RegExp(r).match(uri);
                            });
                        
                    });
            }
            if(perm) return perm;
            return $super(user, request, uri);
        },

    });
