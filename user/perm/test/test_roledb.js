core.testing.client();
core.user.perm.roledb();
db = connect("test");

db.roles.remove({});
db.roles.save({name: 'author', urls: ['admin/blog/post_edit', 'admin/files', 'admin/analytics.*']});

var p = new User.Perm.RoleDB(db.roles);

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
