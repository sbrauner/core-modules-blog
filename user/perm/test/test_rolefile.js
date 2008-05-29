core.testing.client();
core.core.file();
core.user.perm.rolefile();
var cases = core.user.perm.test.roletests();

var f = File.create("author: ['admin/blog/post_edit', 'admin/files', 'admin/analytics.*']\n");

var p = new User.Perm.RoleFile(f);

cases(p);
