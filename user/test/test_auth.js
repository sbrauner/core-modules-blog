db = connect("test");
db.users.remove({});

core.user.user();
core.user.auth();

u = new User();
u.name = "Ethan";
u.email = "ethan@10gen.com";
u.setPassword("truancy");
db.users.save(u);

var cookies = {};

var getHeaders = function(){
    var cookieStrings = [];
    for(var key in cookies){
        cookieStrings.push(key + "=" + cookies[key]);
    }
    return "Cookie:" + cookieStrings.join("; ");
}

var getRequest = function(query){
    return javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , query , getHeaders());
};

var prefix = md5(SERVER_HOSTNAME + new Date().roundMinutes(7));
query = "/?username=Ethan&prefix=" + prefix + "&hash=" + md5(prefix + ":" + u.pass_ha1_name);


request = getRequest(query);
response = { sendRedirectTemporary: function(arg1){ target = arg1; },
                 addCookie: function(key, val) { cookies[key] = val; }};

log.user.auth.level = log.LEVEL.DEBUG;

var user = Auth.cookie.getUser(request, response, "test");

print(user);
print(target);
assert(user.name == "Ethan");

request = getRequest('/');
print(tojson(cookies));
print(getHeaders());
print(request.getCookie('username'));
var user = Auth.cookie.getUser(request, response, "test");
assert(user.name == "Ethan");
