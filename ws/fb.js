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
};

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
};

/* Get an ID for a call
 * Every call to the Facebook API is required to have a unique identifier that is larger than the
 * previous call's identifier.  Facebook suggests using the time in ms.
 */
Facebook.getCallId = function() {
    return (new Date()).getTime();
};

/* Call a facebook API method
 * this method should not need to be called directly
 */
Facebook.call = function(args) {
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
};

/* Calls a facebook method and returns an object */
Facebook.callJSON = function(args) {
    return scope.eval("("+Facebook.call(args)+")");
};


/* Connect to facebook from outside the site.
 * This is used in conjunction with the FB login link (Facebook.getLoginLink).
 *      auth_token : required, returned as a request arg from the Facebook login page
 */
Facebook.connect = function(auth_token) {
    if(!auth_token) return Facebook.err.missingField("auth_token");
    var args = {
        method : "auth.getSession",
        api_key : Facebook.api_key,
        v : "1.0",
        auth_token : auth_token,
        format : "JSON"
    };
    var rq = new XMLHttpRequest("POST",  Facebook.server);
    rq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var result = rq.send(Facebook.getRequest(args));

    // something went wrong with the request itself
    if(result.responseText == "") {
        return Facebook.err.httpError;
    }
    else {
        return result.responseText;
    }
};

/* In order for a Facebook API client to use the API, the user of the client application must be logged in to Facebook. To accomplish this, direct your users to Facebook.getLoginLink(args), which will prompt the user to log in if necessary. */
Facebook.getLoginLink = function(args) {
    return "www.facebook.com/login.php?api_key="+Facebook.api_key+"&v="+Facebook.v+
    (args.next ? "&next="+args.next : "")+
    (args.popup ? "&popup="+args.popup : "")+
    (args.skipcookie ? "&skipcookie="+args.skipcookie : "")+
    (args.hide_checkbox ? "&hide_checkbox="+args.hide_checkbox : "")+
    (args.canvas ? "&canvas="+args.canvas : "");
};

Facebook.Admin = {
    /* Returns the current allocation limit for your application for the specified integration point. */
    getAllocation : function(args) {
        if(!args["integration_point_name"]) return Facebook.err.missingField("integration_point_name");
        args["method"] = "admin.getAllocation";
        return Facebook.call(args);
    },
    /* Returns specified daily metrics for your application, given a date range. */
    getDailyMetrics : function(args) {
        if(!args["start_date"]) return Facebook.err.missingField("start_date");
        if(!args["end_date"]) return Facebook.err.missingField("end_date");
        if(!args["metrics"]) return Facebook.err.missingField("metrics");
        args["method"] = "admin.getDailyMetrics";
        return Facebook.call(args);
    },
    /* Returns values of properties for your applications from the Facebook Developer application. */
    getAppProperties : function(args) {
        if(!args["properties"]) return Facebook.err.missingField("properties");
        args["method"] = "admin.getAppProperties";
        return Facebook.call(args);
    },
    /* Sets values for properties for your applications in the Facebook Developer application. */
    setAppProperties : function(args) {
        args["method"] = "admin.setAppProperties";
        return Facebook.call(args);
    }
};

Facebook.Application = {
    /* Returns public information about a given application (not necessarily your own). */
    getPublicInfo : function(args) {
        args["method"] = "application.getPublicInfo";
        return Facebook.call(args);
    }
};

Facebook.Auth = {
    /* Creates an auth_token to be passed in as a parameter to login.php and then to auth.getSession after the user has logged in. */
    createToken : function(args) {
        args["method"] = "auth.createToken";
        return Facebook.call(args);
    },
    /* Returns the session key bound to an auth_token, as returned by auth.createToken or in the callback URL. */
    getSession : function(args) {
        if(!args["auth_token"]) return Facebook.err.missingField("auth_token");
        args["method"] = "auth.getSession";
        return Facebook.call(args);
    },
    /* Returns a temporary session secret associated to the current existing session, for use in a client-side component to an application. */
    promoteSession : function(args) {
        args["method"] = "auth.promoteSession";
        return Facebook.call(args);
    },
};

Facebook.Batch = {
    /* Execute a list of individual API calls in a single batch. */
    run : function(args) {
        if(!args["method_feed"]) return Facebook.err.missingField("method_feed");
        args["method"] = "batch.run";
        return Facebook.call(args);
    }
};

Facebook.Data = {
    /* Returns all cookies for a given user and application. */
    getCookie : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.getCookie";
        return Facebook.call(args);
    },
    /* Sets a cookie for a given user and application. */
    setCookie : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.setCookie";
        return Facebook.call(args);
    }
};

Facebook.Events = {
    /* Returns all visible events according to the filters specified. */
    get : function(args) {
        args["method"] = "events.get";
        return Facebook.call(args);
    },
    /* Returns membership list data associated with an event. */
    getMembers : function(args) {
        if(!args["eid"]) return Facebook.err.missingField("eid");
        args["method"] = "events.getMembers";
        return Facebook.call(args);
    }
};

Facebook.FBML = {
    /* Fetches and re-caches the image stored at the given URL. */
    refreshImgSrc : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshImgSrc";
        return Facebook.call(args);
    },
    /* Fetches and re-caches the content stored at the given URL. */
    refreshRefURL : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshRefURL";
        return Facebook.call(args);
    },
    /* Associates a given "handle" with FBML markup so that the handle can be used within the fb:ref FBML tag. */
    setRefHandle : function(args) {
        if(!args["handle"]) return Facebook.err.missingField("handle");
        if(!args["fbml"]) return Facebook.err.missingField("fbml");
        args["method"] = "fbml.setRefHandle";
        return Facebook.call(args);
    }
};

Facebook.Feed = {
    /* Publishes a News Feed story to the user corresponding to the session_key parameter. */
    publishStoryToUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishStoryToUser";
        return Facebook.call(args);
    },
    /* Publishes a Mini-Feed story to the user corresponding to the session_key parameter, and publishes News Feed stories to the friends of that user. */
    publishActionOfUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishActionOfUser";
        return Facebook.call(args);
    },
    /* Publishes a Mini-Feed story to the user or Page corresponding to the session_key or page_actor_id parameter. */
    publishTemplatizedAction : function(args) {
        if(!args["title_template"]) return Facebook.err.missingField("title_template");
        args["method"] = "feed.publishTemplatizedAction";
        return Facebook.call(args);
    }
};

Facebook.FQL = {
    /* Evaluates an FQL (Facebook Query Language) query. */
    query : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "fql.query";
        return Facebook.call(args);
    }
}

Facebook.Friends = {
    /* Returns whether or not each pair of specified users is friends with each other. */
    areFriends : function(args) {
        if(!args["uids1"]) return Facebook.err.missingField("uids1");
        if(!args["uids2"]) return Facebook.err.missingField("uids2");
        args["method"] = "friends.getFriends";
        return Facebook.call(args);
    },
    /* Returns the identifiers for the current user's Facebook friends. */
    get : function(args) {
        args["method"] = "friends.get";
        return Facebook.call(args);
    },
    /* Returns the identifiers for the current user's Facebook friends who are signed up for the specific calling application. */
    getAppUsers : function(args) {
        args["method"] = "friends.getAppUsers";
        return Facebook.call(args);
    },
    /* Returns the identifiers for the current user's Facebook friend lists. */
    getLists : function(args) {
        args["method"] = "friends.getLists";
        return Facebook.call(args);
    }
};

Facebook.Groups = {
    /* Returns all visible groups according to the filters specified. */
    get : function(args) {
        args["method"] = "groups.get";
        return Facebook.call(args);
    },
    /* Returns membership list data associated with a group. */
    getMembers : function(args) {
        if(!args["gid"]) return Facebook.err.missingField("gid");
        args["method"] = "groups.getMembers";
        return Facebook.call(args);
    }
};

Facebook.Marketplace = {
    /* Create or modify a listing in Marketplace. */
    createListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        if(!args["show_on_profile"]) return Facebook.err.missingField("show_on_profile");
        if(!args["listing_attrs"]) return Facebook.err.missingField("listing_attrs");
        args["method"] = "marketplace.createListing";
        return Facebook.call(args);
    },
    /* Returns all the Marketplace categories. */
    getCategories : function(args) {
        args["method"] = "marketplace.getCategories";
        return Facebook.call(args);
    },
    /* Return all Marketplace listings either by listing ID or by user. */
    getListings : function(args) {
        args["method"] = "marketplace.getListings";
        return Facebook.call(args);
    },
    /* Returns the Marketplace subcategories for a particular category. */
    getSubCategories : function(args) {
        args["method"] = "marketplace.getSubCategories";
        return Facebook.call(args);
    },
    /* Remove a listing from Marketplace. */
    removeListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        args["method"] = "marketplace.removeListing";
        return Facebook.call(args);
    },
    /* Search Marketplace for listings filtering by category, subcategory and a query string. */
    search : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "marketplace.search";
        return Facebook.call(args);
    }
};

Facebook.Notifications = {
    /* Returns information on outstanding Facebook notifications for current session user. */
    get : function(args) {
        args["method"] = "notifications.get";
        return Facebook.call(args);
    },
    /* Sends a notification to a set of users. */
    send : function(args) {
        if(!args["to_ids"]) return Facebook.err.missingField("to_ids");
        if(!args["notification"]) Facebook.err.missingField("notification");
        args["method"] = "notifications.send";
        return Facebook.call(args);
    },
    /* Sends an email to the specified users who have the application. */
    sendEmail : function(args) {
        if(!args["recipients"]) return Facebook.err.missingField("recipients");
        if(!args["subject"]) return Facebook.err.missingField("subject");
        args["method"] = "notifications.sendEmail";
        return Facebook.call(args);
    }
};

Facebook.Pages = {
    /* Returns all visible pages to the filters specified. */
    getInfo : function(args) {
        if(!args["fields"]) return Facebook.err.missingField("fields");
        args["method"] = "pages.getInfo";
        return Facebook.call(args);
    },
    /* Checks whether the logged-in user is the admin for a given Page. */
    isAdmin : function(args) {
        args["method"] = "pages.isAdmin";
        return Facebook.call(args);
    },
    /* Checks whether the Page has added the application. */
    isAppAdded : function(args) {
        args["method"] = "pages.isAppAdded";
        return Facebook.call(args);
    },
    /* Checks whether a user is a fan of a given Page. */
    isFan : function(args) {
        args["method"] = "pages.isFan";
        return Facebook.call(args);
    }
};

Facebook.Photos = {
    /* Adds a tag with the given information to a photo. */
    addTag : function(args) {
        if(!args["pid"]) return Facebook.err.missingField("pid");
        if(!args["tag_uid"]) return Facebook.err.missingField("tag_uid");
        if(!args["tag_text"]) return Facebook.err.missingField("tag_text");
        if(!args["x"]) return Facebook.err.missingField("x");
        if(!args["y"]) return Facebook.err.missingField("y");
        args["method"] = "photos.addTag";
        return Facebook.call(args);
    },
    /* Creates and returns a new album owned by the current session user. */
    createAlbum : function(args) {
        if(!args["name"]) return Facebook.err.missingField("name");
        args["method"] = "photos.createAlbum";
        return Facebook.call(args);
    },
    /* Returns all visible photos according to the filters specified. */
    get : function(args) {
        if(!args[subj_id]) return Facebook.err.missingField("subj_id");
        if(!args[aid]) return Facebook.err.missingField("aid");
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.get";
        return Facebook.call(args);
    },
    /* Returns metadata about all of the photo albums uploaded by the specified user. */
    getAlbums : function(args) {
        if(!args[uid]) return Facebook.err.missingField("uid");
        if(!args[aids]) return Facebook.err.missingField("aids");
        args["method"] = "photos.getAlbums";
        return Facebook.call(args);
    },
    /* Returns the set of user tags on all photos specified. */
    getTags : function(args) {
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.getTags";
        return Facebook.call(args);
    },
    /* Uploads a photo owned by the current session user and returns the new photo. */
    upload : function(args) {
        if(args.uid && args.session_key) return Facebook.err.mutualExclusion();
        args["method"] = "photos.upload";
        return Facebook.call(args);
    },
};

Facebook.Profile = {
    /* Sets the FBML for a user's profile, including the content for both the profile box and the profile actions. */
    getFBML : function(args) {
        args["method"] = "profile.getFBML";
        return Facebook.call(args);
    },
    /* Gets the FBML that is currently set for a user's profile. */
    setFBML : function(args) {
        args["method"] = "profile.setFBML";
        return Facebook.call(args);
    },
};


Facebook.Users = {
    /* Returns a wide array of user-specific information for each user identifier passed, limited by the view of the current user. */
    getInfo : function(args) {
        if(!args[uids]) return Facebook.err.missingField("uids");
        if(!args[fields]) return Facebook.err.missingField("fields");
        args["method"] = "users.getInfo";
        return Facebook.call(args);
    },
    /* Gets the user ID (uid) associated with the current session. */
    getLoggedInUser : function(args) {
        args["method"] = "users.getLoggedInUser";
        return Facebook.call(args);
    },
    /* Checks whether the user has opted in to an extended application permission. */
    hasAppPermission : function(args) {
        if(!args[ext_perm]) return Facebook.err.missingField("ext_perm");
        args["method"] = "users.hasAppPermission";
        return Facebook.call(args);
    },
    /* Returns whether the logged-in user has added the calling application. */
    isAppAdded : function(args) {
        args["method"] = "users.isAppAdded";
        return Facebook.call(args);
    },
    /* Updates a user's Facebook status. */
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
