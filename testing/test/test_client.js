core.testing.client();

var c = new testing.Client();

c.addCookie("test1", "valu1");

var r = c.getRequest();
assert(c.getRequest().getCookie("test1") == "valu1");

