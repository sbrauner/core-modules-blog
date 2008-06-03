return function(p){
    var u = {name: "Ethan", email: "ethan@10gen.com", nickname: "Muscles"};


    var c = new testing.Client().setAnswer('value');

    var tryAllowed = function(path){
        return c.setURL(path).execute(function(){ return p.allowed(u, request); });
    };

    var output = tryAllowed("/woog");

    assert(output == false);

    var output = tryAllowed("/admin/blog/post_edit");

    assert(output == false);

    u.permissions = ["author"];

    var output = tryAllowed("/woog");

    assert(output == false);

    var output = tryAllowed("/admin/blog/post_edit");

    assert(output == true);

    p.forum = new User.Perm();  // which fails open by default
    
    var output = tryAllowed("/forum/woog");
    assert(output == true);

    var output = tryAllowed("/admin/forum");
    assert(output == false);

    var bigPerm = new User.Perm();
    bigPerm.roles = p;
    
    var tryAllowed = function(path){
        return c.setURL(path).execute(function(){ return bigPerm.allowed(u, request); });
    };

    assert(tryAllowed("/roles/forum/woog") == true);
    assert(tryAllowed("/open") == true);
    assert(tryAllowed("/roles/admin/unknown") == false);
    assert(tryAllowed("/roles/admin/files") == true);
};
