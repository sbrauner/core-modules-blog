/**
    @fileOverview Triggermail API Library - http://triggermail.net/docs/api/
    @author Dana Spiegel - dana@10gen.com
    @version 1.0
 */


/**
    Creates a new TriggermailClient object for using the Triggermail API.
    @class Triggermail API client.
 */
ws.impl.triggermail.TriggermailClient = function(apiKey, secret) {
    // member variables
    this.apiUrl = 'http://api.triggermail.net';
    this.apiKey = apiKey || '';
    this.secret  = secret || '';
    this.version = '1.0';
    this.lastResponseCode = '';    
    this.lastResponse = '';    
};

/**
    Extracts the values of a set of parameters, recursing into nested assoc arrays.
    @param      {Object|Map}    parameters  the collection of parameters whose values should be collected and returned
    @returns    {Array}         An array of all values of the provided collection of parameters
 */
ws.impl.triggermail.TriggermailClient.prototype.__extractValues = function(parameters) {
    values = new Array();
    for (var key in parameters) {
        var value = parameters[key];
        if (isObject(value)) {
            values = values.concat(this.__extractValues(value));
        } else {
            values.push(value);
        }
    }
    return values;
};

/**
    Generates the signature for an Triggermail API call, used for authenticating the client
    @param      {Object|Map}    parameters  The collection of parameters that should be used to generate the method call signature
    @returns    {String}        an MD5 hash of the secret + sorted list of parameter values for an API call
 */
ws.impl.triggermail.TriggermailClient.prototype.__getSignature = function(parameters) {
    var string = this.secret + this.__extractValues(parameters).sort().join('');
    return md5(string);
};

/**
    Converts a nested Map/Object into a simple single level object for use by the API methods
    @param      {Object|Map}    obj         The (nested) object whose properties should be flattened to a single level
    @param      {boolean}       brackets    Whether bracket notation should be used for the current level
    @returns    {Object}        The flattened (nested) object
 */
ws.impl.triggermail.TriggermailClient.prototype.__flatten = function(obj, brackets) {
    var f = {};
    for (var key in obj) {
        value = obj[key];
        var _key = brackets ? '[' + key + ']' : key;
        if (isObject(value)) {
            flattened = this.__flatten(value, true);
            for (var flattenedKey in flattened) {
                f[_key + flattenedKey] = flattened[flattenedKey];
            }
        } else {
            f[_key] = value;
        }
    }
    
    return f;
};

/**
    Coverts an object to a text format and stores each field and its value as an entry in the array
    @param      {Object|Map}    obj     The object/map to be converted
    @returns    {Array[String]} the converted object in string notation
 */
ws.impl.triggermail.TriggermailClient.prototype.__objectToArray = function(obj) {
    fieldArray = new Array();
    for (var key in obj) {
        fieldArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return fieldArray;
}

/**
    Makes a remote method call using either POST or GET for the provided method name
    @param      {String}        type        GET or POST
    @param      {String}        methodName  the remote method to be called
    @param      {Object|Map}    parameters  the parameters for the method to be called
    @returns    {Object}        the object returned by the remote method
 */
ws.impl.triggermail.TriggermailClient.prototype.__callRemoteMethod = function(type, methodName, parameters) {
    if (!methodName) return; // this should really throw an exception
    if (!(type == 'GET' || type == 'POST')) return;

    var xmlHTTPRequest = new XMLHttpRequest();
    parameters.api_key = this.apiKey;
    parameters.format = 'json';
    
    var signature = this.__getSignature(parameters);
    parameters.sig = signature;
    var processedParameters = this.__objectToArray(this.__flatten(parameters)).join('&');

    var content;
    if (type == 'GET') {
        url = this.apiUrl + '/' + methodName + '?' + processedParameters;
        content = '';
    } else {
        url = this.apiUrl + '/' + methodName;
        content = processedParameters;
    }

    xmlHTTPRequest.setRequestHeader('User-Agent', 'Triggermail API 10gen Client v' + this.version);
    xmlHTTPRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    log.ws.impl.triggermail.debug('Calling ' + type + ': ' + url);
    xmlHTTPRequest.open(type, url, false);
    xmlHTTPRequest.send(content);

    // handle the response from the server
    // TODO: rewrite this as a switch statement
    this.lastResponseCode = xmlHTTPRequest.stats;
    if (xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        this.lastResponse = xmlHTTPRequest.responseText;
        return fromjson(xmlHTTPRequest.responseText);
    } else {
        // there's a lower level issue, so fail
        log.ws.impl.triggermail.debug("Error: " + xmlHTTPRequest.status + ': ' + xmlHTTPRequest.statusText);
    }
};

/**
    Gets the status of an email that was sent
    @param      {String}    sendID  The sendID returned by the ws.impl.triggermail.TriggermailClient#send method
    @returns    {Object}    the status of the email
 */
ws.impl.triggermail.TriggermailClient.prototype.getSend = function(sendID) {
    return this.__callRemoteMethod('GET', 'send', {send_id: sendID});
}

ws.impl.triggermail.TriggermailClient.prototype.send = function(template, emailAddress, vars, opts) {
    var parameters = {email: emailAddress, template: template};
    if (vars) parameters.vars = vars;
    if (opts) parameters.options = opts;
    log.ws.triggermail.info(tojson(parameters));
    log.ws.triggermail.info(tojson({ "email" : "dana15@sociabledesign.com" , "template" : "Welcome Email" , "vars" : {  "first_name" : "d" ,  "last_name" : "spiegel"   }}));
    return this.__callRemoteMethod('POST', 'send', parameters);
}

ws.impl.triggermail.TriggermailClient.prototype.getEmail = function(emailAddress) {
    return this.__callRemoteMethod('GET', 'email', {email: emailAddress});
}

ws.impl.triggermail.TriggermailClient.prototype.setEmail = function(emailAddress, vars, lists, templates) {
    var parameters = {email: emailAddress};
    if (vars) parameters.vars = vars;
    if (lists) parameters.lists = lists;
    if (templates) parameters.templates = templates;
    return this.__callRemoteMethod('POST', 'email', parameters);
}

ws.impl.triggermail.TriggermailClient.prototype.getBlast = function(blastID) {
    return this.__callRemoteMethod('GET', 'blast', {blast_id: blastID});
}

ws.impl.triggermail.TriggermailClient.prototype.scheduleBlast = function(name, list, scheduleTime, fromName, fromEmail, subject, contentHTML, contentText, options) {
    var parameters = {name: name};
    if (list) parameters.list = list;
    if (scheduleTime) parameters.schedule_time = scheduleTime;
    if (fromName) parameters.from_name = fromName;
    if (fromEmail) parameters.from_email = fromEmail;
    if (subject) parameters.subject = subject;
    if (contentHTML) parameters.content_html = contentHTML;
    if (contentText) parameters.content_text = contentText;
    if (options) parameters = parameters.concat(options);
    return this.__callRemoteMethod('POST', 'blast', parameters);
}

ws.impl.triggermail.TriggermailClient.prototype.getTemplate = function(template) {
    return this.__callRemoteMethod('GET', 'template', {template: template});
}

ws.impl.triggermail.TriggermailClient.prototype.saveTemplate = function(template, templateFields) {
    var parameters = {template: template};
    if (templateFields) parameters = parameters.concat(templateFields);
    return this.__callRemoteMethod('POST', 'template', parameters);
}


ws.impl.triggermail.TriggermailClient.test = function() {
    var triggermailClient = new ws.impl.triggermail.TriggermailClient('25e432434d00aea9f244a10a38c07fa6', 'dfca8aad2a5d4dbcd70cef264b8072ec');
    var testArgs = {email: 'dana@10gen.com', vars: {first_name: 'Dana', last_name: 'Spiegel'}, lists: {test: 1}};

    // test __extractValues
    var valueArray = triggermailClient.__extractValues(testArgs);
    log.ws.impl.triggermail.debug('valueArray: ' + valueArray);

    // test __flatten
    var flattenedParameters = triggermailClient.__flatten(testArgs, false);
    log.ws.impl.triggermail.debug('flattenedParameters: ' + tojson(flattenedParameters));
 
    var response = triggermailClient.getEmail('dana@10gen.com');
    log.ws.impl.triggermail.debug('Response: ' + triggermailClient.lastResponse);
    log.ws.impl.triggermail.debug('Return: ' + tojson(response));

    response = triggermailClient.setEmail('dana@10gen.com', {first_name: 'Dana', last_name: 'Spiegel'}, {test: 1});
    log.ws.impl.triggermail.debug('Response: ' + triggermailClient.lastResponse);
    log.ws.impl.triggermail.debug('Return: ' + tojson(response));
};
