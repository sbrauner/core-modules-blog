// fb.js - Facebook api


Facebook = {
    /* configuration attributes
     * these must be set per application
     */
    secret_key : "ced4191148da846e833a74674dbf32fb",
    api_key : "eb17c23417bd37e9c00592037393ee13",

    /* standard Facebook variables
       these shouldn't need to change
     */
    server : "http://api.facebook.com/restserver.php",
    v : "1.0",


    /* default options
     * these could change
     */
    //format : "JSON"
    //errHandler : myFunc
};

/* Get an object representing a request and return the URL args in the correct format */
Facebook.getRequest = function(args) {
    var req = [];
    for(var i in args) {
        req.push(i+"="+args[i]);
    }
    return req.join("&")+"&"+Facebook.getSig(args);
}

/* Create the Facebook RESTful signature
 * Every call to the Facebook API requires a signature based on the arguments
 */
Facebook.getSig = function(args) {
    // args = array of args to the request, not counting sig, formatted in non-urlencoded arg=val pairs
    var req = [];
    for(var i in args) {
        req.push(i+"="+args[i]);
    }
    // sorted_array = alphabetically_sort_array_by_keys(args);
    req.sort();
    // request_str = concatenate_in_order(sorted_array);
    var request_str = req.join("");

    // signature = md5(concatenate(request_str, secret))
    return "sig="+md5(request_str + Facebook.secret_key);
}

/* Get an ID for a call
 * Every call to the Facebook API is required to have a unique identifier that is larger than the
 * previous call's identifier.  Facebook suggests using the time in ms.
 */
Facebook.getCallId = function() {
    return (new Date()).getTime();
}

/* Call a facebook API method
 * this method should not need to be called directly
 */
Facebook.call(args) {
    if(!args["api_key"]) args["api_key"] = Facebook.api_key;
    if(!args["session_key"]) args["session_key"] = Facebook.session_key;
    if(!args["v"]) args["v"] = Facebook.v;
    if(!args["call_id"]) args["call_id"] = Facebook.getCallId();

    var rq = new XMLHttpRequest("POST",  Facebook.server);
    // this is supposed to be the default, but for some reason we have to set it anyways...
    rq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var result = rq.send(Facebook.getRequest(args));

    // something went wrong with the request itself
    if(result.responseText == "") {
        return Facebook.err.httpError;
    }
    else {
        return result.responseText;
    }
}

/* Calls a facebook method and returns an object */
Facebook.callJSON(args) {
    return scope.eval("("+Facebook.call(args)+")");
}


Facebook.Photos = {
    addTag : function(args) {
        if(!args["pid"]) return Facebook.err.missingField("pid");
        if(!args["tag_uid"]) return Facebook.err.missingField("tag_uid");
        if(!args["tag_text"]) return Facebook.err.missingField("tag_text");
        if(!args["x"]) return Facebook.err.missingField("x");
        if(!args["y"]) return Facebook.err.missingField("y");
        args["method"] = "photos.addTag";
        return Facebook.call(args);
    },
    createAlbum : function(args) {
        if(!args["name"]) return Facebook.err.missingField("name");
        args["method"] = "photos.createAlbum";
        return Facebook.call(args);
    },
    get : function(args) {
        if(!args[subj_id]) return Facebook.err.missingField("subj_id");
        if(!args[aid]) return Facebook.err.missingField("aid");
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.get";
        return Facebook.call(args);
    },
    getAlbums : function(args) {
        if(!args[uid]) return Facebook.err.missingField("uid");
        if(!args[aids]) return Facebook.err.missingField("aids");
        args["method"] = "photos.getAlbums";
        return Facebook.call(args);
    },
    getTags : function(args) {
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.getTags";
        return Facebook.call(args);
    },
    upload : function(args) {
        if(args.uid && args.session_key) return Facebook.err.mutualExclusion();
        args["method"] = "photos.upload";
        return Facebook.call(args);
    },
};

Facebook.Profile = {
    getFBML : function(args) {
        args["method"] = "profile.getFBML";
        return Facebook.call(args);
    },
    setFBML : function(args) {
        args["method"] = "profile.setFBML";
        return Facebook.call(args);
    },
};


Facebook.Users = {
    getInfo : function(args) {
        if(!args[uids]) return Facebook.err.missingField("uids");
        if(!args[fields]) return Facebook.err.missingField("fields");
        args["method"] = "users.getInfo";
        return Facebook.call(args);
    },

    getLoggedInUser : function(args) {
        args["method"] = "users.getLoggedInUser";
        return Facebook.call(args);
    },

    hasAppPermission : function(args) {
        if(!args[ext_perm]) return Facebook.err.missingField("ext_perm");
        args["method"] = "users.hasAppPermission";
        return Facebook.call(args);
    },

    isAppAdded : function(args) {
        args["method"] = "users.isAppAdded";
        return Facebook.call(args);
    },

    setStatus : function(args) {
        args["method"] = "users.setStatus";
        return Facebook.call(args);
    }
};

Facebook.err = {
    missingField : function(str) { return '{ api_error: "Missing required field '+str+'." }'; },
    httpError : function() { return '{ api_error: "Something went wrong in the http request.  No text was returned." }'; },
    mutualExclusion : function() { return '{ api_error: "Two mutually exclusive arguments were passed to the request."}'; },
};
