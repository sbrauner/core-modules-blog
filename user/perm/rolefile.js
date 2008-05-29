core.ext.stringcompare();
core.user.perm.rolebased();

User.Perm.RoleFile = Class.create(User.Perm.RoleBased, {
    initialize: function($super, file){
        $super();
        this._file = file;
        this._roles = scope.eval("({" + file.asString() + "})");
    },
    getRoleURLs: function(role){
        return this._roles[role];
    },
    getRoles: function(){
        var keys = Object.keys(this._roles).sort(Ext.stringCompare);
        var output = [];
        keys.forEach(function(z){
            output.push({name: z});
        });
        return output;
    },
});
