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
    this.path = path || '';
    this.contentType = 'text/xml';
    this.isAsynchronous = false;
    this.xmlHTTPRequest = new XMLHttpRequest();
    this.lastResponse = '';
    this.isLastResponseFault = false;
    this.lastValue = '';
    this.lastResponseCode = null;
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
            else if (isString(paramter)) value = parameter;
            else value = parameter // this should be base64
            
            callObject.params.push( { _name : "param" , value : value });
        }
    }
    // get the XML for the parameters
SYSOUT(tojson(callObject));
    content += xml.toString( "methodCall" , callObject );
    
    var url = 'http://' + this.host + ':' + this.port + this.path;
    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    
    SYSOUT( content );

SYSOUT('Sending: ' + content);
    this.xmlHTTPRequest.send(content);
    
    // handle the response from the server
    // rewrite this as a switch statement
    SYSOUT('Got Status: ' + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    this.lastResponseCode = this.xmlHTTPRequest.stats;
    if (this.xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        return this._processResponse(this.xmlHTTPRequest.responseText);
    } else {
        // there's a lower level issue, so fail
        SYSOUT("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    };
}

ws.xmlrpc.Client.prototype._processResponse = function(responseText) {
    // <methodResponse><params><param><value><struct><member><name>flerror</name><value><boolean>0</boolean></value></member><member><name>message</name><value>Thanksfortheping.</value></member></struct></value></param></params></methodResponse>

    // { _name : "methodResponse" , $ : [  {  _name : "params" ,  $ : ame><value><boolean>0</boolean></valu[   {   _name : "param" ,   $ : [    {    _name : "value" ,    $ : 
    // [     {     _name : "struct" ,     $ : [      {      _name : 
    // "member" ,      $ : [       {       _name : "name" ,       $ : 
    // "message"        }
    //  ,       {       _name : "value" ,       $ : "Ok"        }
    //  ]       }
    //  ,      {      _name : "member" ,      $ : [       {       _name : 
    // "name" ,       $ : "flerror"        }
    //  ,       {       _name : "value" ,       $ : [        {        _name : 
    // "boolean" ,        $ : "0"         }
    //  ]        }
    //  ]       }
    //  ]      }
    //  ]     }
    //  ]    }
    //  ]   }
    //  ]  }

    SYSOUT('processing response: ' + responseText);
    if (!responseText) {
        // we got no response to process
        this.lastResponse = null;
        return null;
    }
    response = xml.fromString(responseText);
    this.lastResponse = response;
    if (response) {
        if (response._name == 'methodResponse') {
            if (response.$[0]._name == 'values') {
                // we got a valid response
                this.isLastResponseFault = false;
                var value = response.$[0].$[0].$[0].$
                this.lastValue = value;
                return {isFault: false, value: value};
            } else if (response.$[0]._name == 'fault') {
                // we got an XML-RPC fault
                this.isLastResponseFault = true;
                var value = response.$[0].$[0].$
                this.lastValue = value;
                var faultString = value[0].$[0].$[1].$[0].$;
                var faultValue = value[0].$[1].$[1].$[0].$;
                return {isFault: true, faultString: faultString, faultValue: faultValue};
            }
        }
    }
    
    // we received no response or an invalid response
    return null;
};



ws.xmlrpc.Client.Test = function() {
    // create a new object
//    var client = new ws.xmlrpc.Client('ping.feedburner.com');
    var client = new ws.xmlrpc.Client('rpc.technorati.com', 80, '/rpc/ping');
//    var client = new ws.xmlrpc.Client('rpc.pingomatic.com', 80, '/RPC2');
//    client.methodCall('sample.sumAndDifference', [6, 3]);
//    client.methodCall('sample.sumAndDifference', [1, 1.5, new Date(), true, false, "this is a test"]);

    // test XML-RPC blog ping
    var response = client.methodCall('weblogUpdates.ping', ['Silicon Alley Insider', 'http://www.alleyinsider.com/', 'http://www.alleyinsider.com/2008/2/barack_obama__live_from_seattle']);
    
    if (!response) {
        SYSOUT('Got empty response');
    } else {
        if (response.isFault) {
            // we got a fault
            SYSOUT('Fault: (' + response.faultValue + ') ' + response.faultString);
        } else {
            SYSOUT('Success: ' + tojson(response.value));
        }
    }
};

