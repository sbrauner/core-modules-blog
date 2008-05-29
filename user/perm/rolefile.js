core.user.perm.rolebased();

User.Perm.RoleFile = Class.create(User.Perm.RoleBased, {
        initialize: function($super, file){
            $super();
            this._file = file;
            this._roles = scope.eval("({" + file.asString() + "})");
        },
        getRoleURLs: function(role){
            return this._roles[role];
        }
    });
