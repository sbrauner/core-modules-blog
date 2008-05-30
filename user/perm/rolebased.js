/** Role-based authorization.
 *  Every permission in the user is checked and the URLs it grants are
 *  looked up.
 *  Subclasses have to define getRoleURLs(permission).
 *  URLs are matched inexactly against the URL we've been given; I'm not sure
 *  this is the correct behavior. Well, you can always write expressions that
 *  start with ^ and end with $.
 */
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

    /**
     * getRoleURLs: return a list of URL expressions for a given permission.
     * This method must be overridden by subclasses.
     * @param {String} permission The role to get URLs for.
     */
    getRoleURLs: function(permission){
        throw "getRoleURLs on a RoleBased class";
    },
});
