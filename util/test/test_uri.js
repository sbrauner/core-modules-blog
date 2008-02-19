core.util.uri();

s = 'http://localhost:8080/a/b/c/?hi=there&you=funny';
u = new URI(s);
assert(u.scheme == 'http');
assert(u.hostname == 'localhost:8080');
assert(u.path == '/a/b/c/');
assert(u.toString() == s);

u.replaceArg('you', 'money');
assert(u.toString() == 'http://localhost:8080/a/b/c/?hi=there&you=money');

u.addArg('you', 'sunny');
assert(u.toString() == 'http://localhost:8080/a/b/c/?hi=there&you=money&you=sunny');

s = 'localhost:8080/bugs/';
u = new URI(s);

assert(u.scheme == 'http');
assert(u.hostname == 'localhost:8080');
assert(u.path == '/bugs/');

s = "http://localhost:8080/bugs/?number=&title=&owner=Ethan&status=&severity=&type=&project=&area=&creationDate=&lastModified=";
u = new URI(s);

assert(u.scheme = 'http');
assert(u.hostname == 'localhost:8080');
assert(u.path == '/bugs/');

s = "/bugs/?number=&title=";
u = new URI(s);

assert(u.toString() == s);
