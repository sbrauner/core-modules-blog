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
];
    
Blog.ping = function(articleUrl) {
    // if articleUrl is empty, ping just the entire blog, instead of an individual article
    if (!articleUrl || articleUrl.length == 0) articleUrl = siteUrl;
    
    // cycle through all of the defined ping services
    Blog.pingService.forEach( function(service) {
<<<<<<< HEAD:blog/ping.js
				  try {
				      SYSOUT('Pinging: ' + service.url);
				      var client = new ws.xmlrpc.Client(service.url, service.port, service.path);
				      var response = client.methodCall('weblogUpdates.ping', [siteName, siteUrl, articleUrl]);
				      
				      if (!response) {
					  SYSOUT('Got empty response');
				      } 
				      else {
					  if (response.isFault) {
					      // we got a fault
					      SYSOUT('Fault: (' + response.faultValue + ') ' + response.faultString);
					  }
					  else {
					      var flerror;
					      var message;
					      response.value.$.forEach( function(member) {
									    var name = member.$[0].$;
									    if (name == 'flerror') {
										flerror = member.$[1].$[0].$;
									    } 
									    else if (name == 'message') {
										if (isArray(member.$[1].$)) {
										    message = member.$[1].$[0].$;
										} 
										else {
										    message = member.$[1].$;
										}
										message = message.toString().replace(/&#32;/g, ' ');
									    }
									    
									})
						  SYSOUT('Success: ' + message + ' (flerror: ' + flerror + ')');
					  }
				      }
				  }
				  catch ( e ){
				      print( "failed to ping [" + tojson( service ) + "] because of : " + e );
				  }
			      });
=======
        SYSOUT('Pinging: ' + service.url);
        var client = new ws.xmlrpc.Client(service.url, service.port, service.path);
        var response = client.methodCall('weblogUpdates.ping', [siteName, siteUrl, articleUrl]);
        
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
>>>>>>> 1b03fc7b3e568337d8edb8dffbb3c48679bdcd79:blog/ping.js
};
