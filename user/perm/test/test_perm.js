core.user.perm.deny();
Util.URLTree.log.level = log.LEVEL.DEBUG;

var p = new User.Perm();

var u = {name: "Ethan", email: "ethan@10gen.com", nickname: "Muscles"};

core.testing.client();

var c = new testing.Client().setAnswer('value');

var tryAllowed = function(path){
    return c.setURL(path).execute(function(){ return p.allowed(u, request); });
};

var output = tryAllowed("/foo");
assert(output == true);

p.forum = new User.Perm.Deny();
p.admin = false;

var output = tryAllowed("/forum");
//assert(output == false);
print(output);

var output = tryAllowed("/admin");
//assert(output == false);
print(output);
