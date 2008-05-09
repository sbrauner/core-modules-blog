/**
 * Weblogs Ping 
 *
 * Specification: http://www.xmlrpc.com/weblogsCom
 *
 * @author Dana Spiegel (dana@10gen.com)
 * @created Feb 9, 2007
 * @updated Feb 9, 2007
**/

core.ws.xmlrpc.client();

Blog.pingService = [
    {url: 'ping.feedburner.com', port: 80, path: '/'},
    {url: 'rpc.technorati.com', port: 80, path: '/rpc/ping'},
    {url: 'blogsearch.google.com', port: 80, path: '/ping/RPC2'},
    {url: 'rpc.weblogs.com', port: 80, path: '/RPC2'},
    {url: 'www.pheedo.com', port: 80, path: '/api/rpc'},
];
    
Blog.ping = function(articleUrl) {
    t = fork( Blog.pingSync , articleUrl );
    t.start();
}

Blog.pingSync = function(articleUrl) {
    // if articleUrl is empty, ping just the entire blog, instead of an individual article
    if (!articleUrl || articleUrl.length == 0) articleUrl = siteUrl;
    
    // cycle through all of the defined ping services
    Blog.pingService.forEach( function(service) {

        SYSOUT('Pinging: ' + service.url);
        var client = new ws.xmlrpc.Client(service.url, service.port, service.path);
        var response = null;
	try {
	    response = client.methodCall('weblogUpdates.ping', [siteName, siteUrl, articleUrl]);
	}
	catch ( e ){
	    print( "couldn't ping : " + tojson( service ) + " because of " + e );
	    return;
	}
        
        if (!response) {
            SYSOUT('Got empty response');
        } else {
            if (response.isFault) {
                // we got a fault
                SYSOUT('Fault: (' + response.faultValue + ') ' + response.faultString);
            } else {
                var flerror;
                var message;
                response.value.children.forEach( function(member) {
                    var name = member.children[0].$;
                    if (name == 'flerror') {
                        flerror = member.children[1].children[0].$;
                    } else if (name == 'message') {
                        if (isArray(member.children[1].children)) {
                            message = member.children[1].children[0].$;
                        } else {
                            message = member.children[1].$;
                        }
                        message = message.replace(/&#32;/g, ' ');
                    }
                    
                })
                SYSOUT('Success: ' + message + ' (flerror: ' + flerror + ')');
            }
        }
    });

};
