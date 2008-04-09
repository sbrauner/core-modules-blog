/**
 * Akismet Client
 *
 * Specification: http://akismet.com/development/api/
 *
 * @author Dana Spiegel (dana@10gen.com)
 * @created Apr 09, 2007
 * @updated Apr 09, 2007
**/

ws.akismet.USER_AGENT = '10gen/1.0';
ws.akismet.HOST = 'rest.akismet.com/1.1';

ws.akismet.Akismet = function(apiKey, blogUri) {
    // member variables
    this.apiKey = apiKey || '';
    this.blogUri = blogUri|| '';
    this.contentType = 'application/x-www-form-urlencoded';
    this.isAsynchronous = false;
    this.xmlHTTPRequest = new XMLHttpRequest();
};

ws.akismet.Akismet.prototype.__remoteMethod = function(method, userIp, userAgent, commentAuthor, commentContent) {
    var url = 'http://' + this.apiKey + '.' + ws.akismet.HOST + '/' + method;
    log.ws.akismet.debug ('Calling REST Method: ' + url);

    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    this.xmlHTTPRequest.setRequestHeader("User-Agent", ws.akismet.USER_AGENT);

    content = 'blog=' + escape(this.blogUri);
    content += '&user_ip=' + escape(userIp);
    content += '&user_agent=' + escape(ws.akismet.USER_AGENT);
    content += '&comment_author=' + escape(commentAuthor);
    content += '&comment_type=comment';
    content += '&comment_content=' + escape(commentContent);
    
    log.ws.akismet.debug('Content string: ' + content);

    this.xmlHTTPRequest.send(content);
    
    // handle the response from the server
    // TODO: rewrite this as a switch statement
    if (this.xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        log.ws.akismet.debug('Got Response: ' + this.xmlHTTPRequest.responseText);
        return this.xmlHTTPRequest.responseText == 'true';
    } else {
        // there's a lower level issue, so fail
        log.ws.akismet.ERROR("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    }    
};

ws.akismet.Akismet.prototype.verifyKey = function() {
    var url = 'http://' + ws.akismet.HOST + '/verify-key';
    log.ws.akismet('Calling REST Method: ' + url);

    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    this.xmlHTTPRequest.setRequestHeader("User-Agent", ws.akismet.USER_AGENT);

    content = 'blog=' + escape(this.blogUri);
    content += '&key=' + escape(this.apiKey);
    
    log.ws.akismet.debug('Request Content: ' + content);

    this.xmlHTTPRequest.send(content);
    
    // handle the response from the server
    // TODO: rewrite this as a switch statement
    if (this.xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        log.ws.akismet.debug('Got Response: ' + this.xmlHTTPRequest.responseText);
        return this.xmlHTTPRequest.responseText == 'valid';
    } else {
        // there's a lower level issue, so fail
        log.ws.akismet.error("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    }    
};

ws.akismet.Akismet.prototype.commentCheck = function(userIp, userAgent, commentAuthor, commentContent) {
    return this.__remoteMethod('comment-check', userIp, userAgent, commentAuthor, commentContent);
};

ws.akismet.Akismet.prototype.submitSpam = function(userIp, userAgent, commentAuthor, commentContent) {
    return this.__remoteMethod('submit-spam', userIp, userAgent, commentAuthor, commentContent);
};

ws.akismet.Akismet.prototype.submitHam = function(userIp, userAgent, commentAuthor, commentContent) {
    return this.__remoteMethod('submit-ham', userIp, userAgent, commentAuthor, commentContent);
};
