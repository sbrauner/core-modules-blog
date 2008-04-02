db = connect("test");
db.users.remove({});

core.testing.client();

core.user.user();
core.user.auth();

u = new User();
u.name = "Ethan";
u.email = "ethan@10gen.com";
u.setPassword("truancy");
db.users.save(u);

// First, log in using query arguments

var prefix = md5(SERVER_HOSTNAME + new Date().roundMinutes(7));
query = "/?username=Ethan&prefix=" + prefix + "&hash=" + md5(prefix + ":" + u.pass_ha1_name);

log.user.auth.level = log.LEVEL.DEBUG;

client = new testing.Client();
client.setAnswer("value");
var user = client.setURL(query).execute(function(){
    return Auth.cookie.getUser(request, response, "test");
});

assert(user.name == "Ethan");

// That should have set cookies, so now we should be authenticated w/o
// query args
var user = client.setURL().execute(function(){
        return Auth.cookie.getUser(request, response, "test");
    });

assert(user.name == "Ethan");

db.users.remove({});
