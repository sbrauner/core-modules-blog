app.Forum.Controller = {};

app.Forum.Controller.bannedUsers = function(){
    return {};
};

app.Forum.Controller.anonymousPermissions = function(){
    return {viewTopicNonHidden: true, viewThreadNonHidden: true};
};

app.Forum.Controller.memberPermissions = function(){
    var p = {createThread: true,
        makePost: true
            };
    // add anonymousPermissions
    return Object.extend(p, app.Forum.Controller.anonymousPermissions());
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

        // post stuff
        editPost: true,
        deletePost: true,
        movePost: true, splitPost: true,

        // topic stuff
        createTopic: true, renameTopic: true,
        moveTopic: true, deleteTopic: true,
        hideTopic: true,

        // thread stuff
        moveThread: true,
        deleteThread: true,
        moderateThread: true,
        stickyThread: true,
        edPickThread: true,

        // restore deleted posts
        viewDeleted: true,
        viewSpecialTopic_Deleted: true
    };
    // add moderator permissions
    return Object.extend(p, app.Forum.Controller.moderatorPermissions());
};

app.Forum.Controller.hasPermission = function(user, perm){
    if(user == null || user in app.Forum.Controller.bannedUsers()){
        // treat user as anonymous
        return (perm in app.Forum.Controller.anonymousPermissions());
    }

    var type = app.Forum.Controller.userPermissionType(user);

    // if type == "MEMBER" we go to app.Forum.Controller.memberPermissions,
    // if type == "MODERATOR" we go to ...moderatorPermissions,
    // etc. So we do a lookup; use the type to find the right function, and call
    // it. If the permission is in the returned object, return true.
    return (perm in app.Forum.Controller[type.toLowerCase()+'Permissions']());

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
    MEMBER: "core.app.forum.member"
};

app.Forum.Controller.userPermissionType = function(user){
    if(! user) return null;
    if(user.isAdmin() || user.hasPermission(app.Forum.Controller.permissions.ADMIN))
        return "ADMIN";
    if(user.hasPermission(app.Forum.Controller.permissions.MODERATOR))
        return "MODERATOR";
    return "MEMBER";
};
