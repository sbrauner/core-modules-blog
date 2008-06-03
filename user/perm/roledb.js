core.user.perm.rolebased();
// FIXME: currently, if a user doesn't have permission to access something, but
// there's a child permission object that grants permission to the same thing,
// permission will be granted. I don't know if this is the corrcet behavior
// or not.

// Similarly, if this class has a role that grants permission to something,
// child permissions aren't even consulted (even if they deny access to that
// thing).
User.Perm.RoleDB = Class.create(User.Perm.RoleBased, {
    initialize: function($super, collection){
        $super();
        this._collection = collection;
    },
    getRoleURLs: function(role){
        var r = this._collection.findOne({name: role});
        if(! r) return null;
        return r.urls;
    },
});
