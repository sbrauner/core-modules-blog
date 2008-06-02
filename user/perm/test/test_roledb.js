core.testing.client();
core.user.perm.roledb();
var cases = core.user.perm.test.roletests();
db = connect("test");

db.roles.remove({});
db.roles.save({name: 'author', urls: ['admin/blog/post_edit', 'admin/files', 'admin/analytics.*']});

var p = new User.Perm.RoleDB(db.roles);

cases(p);
