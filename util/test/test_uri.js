core.util.uri();

s = 'http://localhost:8080/a/b/c/?hi=there&you=funny'
u = new URI(s);
assert(u.scheme == 'http://');
assert(u.hostname == 'localhost:8080');
assert(u.path == '/a/b/c/');
assert(u.toString() == s);
