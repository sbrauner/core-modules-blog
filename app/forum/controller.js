log.app.forum.info("Running forum.controller"+app + app.Forum);
app.Forum.Controller = {};

app.Forum.Controller.bannedUser = function(user, request){
    if(db.forum.banned_users.findOne({user: user})) return true;
    if(db.forum.banned_ips.findOne({ip: request.getRemoteIP()})) return true;
    return false;
};

app.Forum.Controller.unknownPermissions = function(){
    return {viewTopicNonHidden: true, viewThreadNonHidden: true};
};

app.Forum.Controller.memberPermissions = function(){
    var p = {createThread: true,
        makePost: true
            };
    // add anonymousPermissions
    return Object.extend(p, app.Forum.Controller.unknownPermissions());
};

app.Forum.Controller.moderatorPermissions = function(){
    var p = {
        moderatePost: true,
        viewModerated: true,
        viewSpecialTopic_Moderated: true
    };

    // add memberPermissions
    return Object.extend(p, app.Forum.Controller.memberPermissions());
};

app.Forum.Controller.adminPermissions = function(){
    var p = {
        // user stuff
        banUser: true,
        banIP: true,
        editUser: true,

        // post stuff
        editPost: true,
        deletePost: true,
        movePost: true, splitPost: true,

        // topic stuff
        createTopic: true, renameTopic: true,
        moveTopic: true, deleteTopic: true,
        hideTopic: true,
        viewTopicHidden: true,

        // thread stuff
        editThread: true,
        moveThread: true,
        deleteThread: true,
        moderateThread: true,
        stickyThread: true,
        edPickThread: true,

        // restore deleted posts
        viewDeleted: true,
        viewSpecialTopic_Deleted: true,

        // this can DoS the forum
        recalculateCounts: true
    };
    // add moderator permissions
    return Object.extend(p, app.Forum.Controller.moderatorPermissions());
};

globalCachedPermissions = {};
app.Forum.Controller.hasPermission = function(user, perm){
    var id = null;
    if(user == null)
        id = request.getRemoteIP();
    else
        id = user._id.toString();

    if(! globalCachedPermissions[id]){
        globalCachedPermissions[id] = app.Forum.Controller.getPermissions(user);
    }

    return (perm in globalCachedPermissions[id]);
};

app.Forum.Controller.getPermissions = function(user){
    // FIXME: throw an exception if we find a banned user? We should be
    // handling all of these at the page level.
    if(user == null || app.Forum.Controller.bannedUser(user, request)){
        // treat user as anonymous
        return (app.Forum.Controller.unknownPermissions());
    }

    // if type == "MEMBER" we go to app.Forum.Controller.memberPermissions,
    // if type == "MODERATOR" we go to ...moderatorPermissions,
    // etc. So we do a lookup; use the type to find the right function, and call
    // it. If the permission is in the returned object, return true.
    var type = app.Forum.Controller.userPermissionType(user);
    return app.Forum.Controller[type.toLowerCase()+'Permissions']();
};

app.Forum.Controller.getAllPostsDeletedByUser_Query = function(user){
    return db.forum.posts.find({deleted: user});
};

// Special ObjectIds to refer to the special "deleted" and "moderated" topics.
app.Forum.Controller.specialDeletedID = ObjectId("00000000000000000000001");
app.Forum.Controller.specialModeratedID = ObjectId("00000000000000000000002");

app.Forum.Controller.permissions = {
    ADMIN: "core.app.forum.admin",
    MODERATOR: "core.app.forum.moderator",
    MEMBER: "core.app.forum.member",
    UNKNOWN: "core.app.forum.unknown",

};

app.Forum.Controller.missingPermission = function(user){
    if(! user) return "account";

    statuses = Ext.getlist(allowModule, "forum", "needStatuses");
    if(statuses){
        for(var i in statuses){
            if(! user.hasPermission(statuses[i]))
                return statuses[i];
        }
    }
    return false;
};

app.Forum.Controller.userPermissionType = function(user){
    if(! user) return "UNKNOWN";

    for(var key in app.Forum.Controller.permissions){
        if(user.hasPermission(app.Forum.Controller.permissions[key]))
            return key;
    }

    // OK, we better guess
    if(user.isAdmin())
        return "ADMIN";
    if(app.Forum.Controller.missingPermission(user))
        return "UNKNOWN";
    return "MEMBER";
};

app.Forum.Controller.canPost = function(thread){
    return app.Forum.Controller.hasPermission(user, "makePost")
        && thread.commentsEnabled && thread.postable();
};
