/**
 * http.sh
 *
 * HTTP related stuff for djang10
 *
 *  modeled after  django.http package
 */

/**
 * object rep of a HTTP response, expected as the return from the
 * various methods in view.py
 * 
 * @TODO - get django source and see
 *  
 * @param s body content of Http response
 */
function HttpResponse(c) {
    this.content = c;
}

HttpResponse.prototype.getContent = function() {
    return this.content;
}

/**
 *  object rep of Http Request.  Right now, just wraps our own request object
 *  to make it look like django (-ish)
 * @param req
 */
function HttpRequest(req) {
    this.request = req;
}

HttpRequest.prototype.getRequest = function() {
    return this.request;
}
