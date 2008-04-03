core.testing.client();

var c = new testing.Client();

c.addCookie("test1", "valu1");

var r = c.getRequest();
assert(c.getRequest().getCookie("test1") == "valu1");

var urls = ['/', '/forum/thread_edit', '/blog?page=4'];

urls.forEach(function(u){
    var url = c.setURL(u).setAnswer("value").execute(function(){
        return request.getURL();
    });
    assert(u == url);
});

urls.forEach(function(u){
    var redirects = c.setURL(u).setAnswer("redirects").execute(function(){
        response.sendRedirectTemporary("?");
    });
    assert(redirects.length == 1);
    assert(redirects[0].type == "temporary");
    assert(redirects[0].location == "?");
});

c.setAnswer("value");
var key1 = c.setURL('/').addArgs({key1: 'hi', arg: 'yo'}).execute(function(){
    return request.key1;
});

assert(key1 == 'hi');

