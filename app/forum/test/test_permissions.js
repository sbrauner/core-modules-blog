db = connect("tests");

core.testing.client();

c = new testing.Client();
c.setAnswer("output");
c.addHeader("X-Cluster-Client-Ip: 127.0.0.1");

var output = c.execute(function(){
    core.app.forum.index();
});

assert(! (output.match(/onclick="newTopic\(/)));

var output = c.withPermission("core.app.forum.admin", function(){
    core.app.forum.index();
});

assert(output.match(/onclick="newTopic\(/));

