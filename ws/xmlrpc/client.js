/**
 * XML-RPC Client
 *
 * Specification: http://www.xmlrpc.com/spec
 *
 * @author Dana Spiegel (dana@10gen.com)
 * @created Feb 05, 2007
 * @updated Feb 05, 2007
**/
 
core.content.xml();


ws.xmlrpc.Client = function(host, port, path) {
    // member variables
    this.host = host || '';
    this.port = port || 80;
    this.path = path || '/RPC2';
    this.contentType = 'text/xml';
    this.isAsynchronous = false;
    this.xmlHTTPRequest = new XMLHttpRequest();
};


/**
 * Makes an XML-RPC method call to the configured host:port/path
 */
ws.xmlrpc.Client.prototype.methodCall = function(methodName, parameters) {
    if (!methodName) return; // this should really throw an exception
    
    var content = '<?xml version="1.0"?>\n';
    var callObject = { methodName : methodName, params: [] };
    if (parameters) {
        // process each passed in parameter in the parameters array, and convert to the proper type
        for (var i in parameters) {
            var parameter = parameters[i];
            var value = null;
            if (isNumber(parameter)) value = { i4 : parameter.toFixed() }; // we need also a double
            else if (isDate(parameter)) value = { 'dateTime.iso8601': parameter.format("yyyyMMdd'T'HH:mm:ss") };
            else if (isBool(parameter)) value = { 'boolean': parameter ? 1 : 0 };
            else if (isString(paramter)) value = { string: parameter };
            else value = { string: parameter } // this should be base64
            
            callObject.params.push( { _name : "param" , value : value });
        }
    }
    // get the XML for the parameters
    content += xml.toString( "methodCall" , callObject );
    
    var url = 'http://' + this.host + ':' + this.port + this.path;
    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    
    SYSOUT( content );

    this.xmlHTTPRequest.send(content);
    
    // handle the response from the server
    // rewrite this as a switch statement
    SYSOUT('Got Status: ' + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    if (this.xmlHTTPRequest.status == 200) {
        ws.xmlrpc.Client.processResponse(this.xmlHTTPRequest.responseText);
    } else {
        SYSOUT("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    };
}

ws.xmlrpc.Client.processResponse = function(responseText) {
    SYSOUT('processing response: ' + responseText);
    response = xml.fromString(responseText);
    SYSOUT('RESPONSE: ' + tojson(response));
}



ws.xmlrpc.Client.Test = function() {
    // create a new object
    var client = new ws.xmlrpc.Client('localhost', 9001);
    client.methodCall('sample.sumAndDifference', [6, 3]);
//    client.methodCall('sample.sumAndDifference', [1, 1.5, new Date(), true, false, "this is a test"]);
};

ws.xmlrpc.Client.Test2 = function() {
    // create a new object
    var client = new ws.xmlrpc.Client( "rpc.technorati.com" , 80 , "/rpc/ping"  );
    client.methodCall( "weblogUpdates.ping", [ "Silicon Alley Insider" , "http://www.alleyinsider.com/" , "http://www.alleyinsider.com/2008/2/barack_obama__live_from_seattle" ] );
//    client.methodCall('sample.sumAndDifference', [1, 1.5, new Date(), true, false, "this is a test"]);
}
