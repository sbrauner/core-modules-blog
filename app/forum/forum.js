Forum.ForumController = {};

Forum.ForumController.bannedUsers = function(){
    return {};
};

Forum.ForumController.anonymousPermissions = function(){
    return {viewTopicNonHidden: true, viewThreadNonHidden: true};
};

Forum.ForumController.memberPermissions = function(){
    var p = {};
    // add anonymousPermissions
    return Object.extend(p, Forum.ForumController.anonymousPermissions());
};

Forum.ForumController.moderatorPermissions = function(){
    var p = {viewSpecialTopic_Moderated: true,
        moderatePost: true};

    // add memberPermissions
    return Object.extend(p, Forum.ForumController.memberPermissions());
};

Forum.ForumController.adminPermissions = function(){
    var p = {
	// user stuff
	banUser: true,
	banIP: true, 
	
	// post stuff
	editPost: true,
	deletePost: true,

	// topic stuff
	createTopic: true, renameTopic: true,
	moveTopic: true, deleteTopic: true,
	hideTopic: true,
	
	// thread stuff
	moveThread: true,
	stickyThread: true,
	     
	// who the hell knows?
	viewSpecialTopic_Deleted: true
    };
    // add moderator permissions
    return Object.extend(p, Forum.ForumController.moderatorPermissions());
};

Forum.ForumController.hasPermission = function(user, perm){
    if(user == null || user in Forum.ForumController.bannedUsers()){
        // treat user as anonymous
        return (perm in Forum.ForumController.anonymousPermissions());
    }

    var type = Forum.ForumController.userPermissionType(user);

    // if type == "MEMBER" we go to Forum.ForumController.memberPermissions,
    // if type == "MODERATOR" we go to ...moderatorPermissions,
    // etc. So we do a lookup; use the type to find the right function, and call
    // it. If the permission is in the returned object, return true.
    return (perm in Forum.ForumController[type.toLowerCase()+'Permissions']());

};

Forum.ForumController.getAllPostsDeletedByUser_Query = function(user){
    return db.forum.posts.find({deleted: user});
};

// Special ObjectIds to refer to the special "deleted" and "moderated" topics.
Forum.ForumController.specialDeletedID = ObjectId("00000000000000000000001");
Forum.ForumController.specialModeratedID = ObjectId("00000000000000000000002");

Forum.ForumController.permissions = {
    ADMIN: "core.app.forum.admin",
    MODERATOR: "core.app.forum.moderator",
    MEMBER: "core.app.forum.member"
};

Forum.ForumController.userPermissionType = function(user){
    if(! user) return null;
    if(user.isAdmin() || user.hasPermission(Forum.ForumController.permissions.ADMIN))
        return "ADMIN";
    if(user.hasPermission(Forum.ForumController.permissions.MODERATOR))
        return "MODERATOR";
    return "MEMBER";
};
