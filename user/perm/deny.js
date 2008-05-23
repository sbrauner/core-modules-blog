User.Perm.Deny = Class.create(User.Perm, {
    allowed: function(user, request){
        return false;
    },
});
