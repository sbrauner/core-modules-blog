core.testing.httpunit();
var wc = new testing.HttpUnit();
wc.setAuthorization('test@10gen.com', 'test');
print(wc.getResponse('http://localhost:1338/admin/'));
