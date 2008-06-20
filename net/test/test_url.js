core.net.url();
core.testing.client();

s = 'http://localhost:8080/a/b/c/?hi=there&you=funny';
u = new URL(s);
assert(u.scheme == 'http');
assert(u.hostname == 'localhost');
assert(u.port == "8080");
assert(u.path == '/a/b/c/');
assert(u.toString() == s);

u = u.replaceArg('you', 'money');
assert(u.toString() == 'http://localhost:8080/a/b/c/?hi=there&you=money');

u = u.addArg('you', 'sunny');
assert(u.toString() == 'http://localhost:8080/a/b/c/?hi=there&you=money&you=sunny');

s = 'localhost:8080/bugs/';
u = new URL(s);

assert(u.scheme == 'http');
assert(u.hostname == 'localhost');
assert(u.port == "8080");
assert(u.path == '/bugs/');

s = "http://localhost:8080/bugs/?number=&title=&owner=Ethan&status=&severity=&type=&project=&area=&creationDate=&lastModified=";
u = new URL(s);

assert(u.scheme = 'http');
assert(u.hostname == 'localhost');
assert(u.port == "8080");
assert(u.path == '/bugs/');

s = "/bugs/?number=&title=";
u = new URL(s);

assert(u.toString() == s);

u = u.removeArg("number");

assert(u.toString() == "/bugs/?title=");


s = "/bugs/?number=&title=&whee=";
u = new URL(s);
u = u.removeArg("title");
assert(u.toString() == "/bugs/?number=&whee=");

s = "/bugs/#anchor1";
u = new URL(s);
assert(u.toString() == s);
assert(u.anchor == "anchor1");

s = "localhost:8080/bugs/?number=1#anchor";
u = new URL(s);
assert(u.toString() == "http://"+s);
assert(u.anchor == "anchor");
assert(u.hostname == "localhost");
assert(u.port == "8080");
assert(u.path == "/bugs/");

s = "/bugs/#anchor1";
u = new URL(s).addArg("number", "40").addArg("truth", "").addArg("you", "honey");
assert(u.toString() == "/bugs/?number=40&truth=&you=honey#anchor1");

assert(URL.unescape_queryargs('%41+%45') == "A E");

assert(URL.escape_queryargs('&') == '%26');

assert( URL.escape_queryargs( " " ) == "+" );
assert( URL.escape_queryargs( " " , true ) == "%20" );

assert( URL.unescape_queryargs( "+" ) == " " );
assert( URL.unescape_queryargs( "+" , true ) == "+" );

var c = new testing.Client();
c = c.setAnswer("value");

var l = c.setURL("http://localhost:2008/blog/posts/").execute(function(){
    return LocalURL("/~~/f.jxp?id=deadbeefdeadbeefdeadbeef&maxX=154&maxY=115");
});

assert(l.hostname == "localhost");
assert(l.port == 2008);
assert(l.toString() == "http://localhost:2008/~~/f.jxp?id=deadbeefdeadbeefdeadbeef&maxX=154&maxY=115");


var thisUrl = function(){
    return LocalURL().toString();
};

var hahaUrl = function(){
    return LocalURL('/haha').toString();
};

core.testing.client();
var c = new testing.Client();
c.setAnswer('value');
var hostname = 'http://www.clusterstock.com';
var currentURL = hostname + '/rss?category=foo';
var l = c.setURL(currentURL).execute(thisUrl);

assert(l == currentURL);

var l = c.execute(hahaUrl);

assert(l == hostname+'/haha');
hostname = hostname + ':8080';
var currentURL = hostname+'/rss?category=foo';
c.setURL(currentURL);

var l = c.execute(thisUrl);

assert(l == currentURL);

var l = c.execute(hahaUrl);

assert(l == hostname + '/haha');

