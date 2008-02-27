Forum.ForumController = {};

Forum.ForumController.bannedUsers = function(){
    return {};
};

Forum.ForumController.anonymousPermissions = function(){
    return {viewTopicNonHidden: true, viewThreadNonHidden: true};
};

Forum.ForumController.userPermissions = function(){
    var p = {};
    // add anonymousPermissions
    return Object.extend(p, Forum.ForumController.anonymousPermissions());
};

Forum.ForumController.moderatorPermissions = function(){
    var p = {viewSpecialTopic_Moderated: true};

    // add userPermissions
    return Object.extend(p, Forum.ForumController.userPermissions());
};

Forum.ForumController.adminPermissions = function(){
    var p = {banUser: true, banIP: true, editPost: true,
        deletePost: true,
        createTopic: true, renameTopic: true,
        moveTopic: true, deleteTopic: true,
        hideTopic: true,
        viewSpecialTopic_Deleted: true};
    // add moderator permissions
    return Object.extend(p, Forum.ForumController.moderatorPermissions());
};

Forum.ForumController.hasPermission = function(user, perm){
    if(user == null || user in Forum.ForumController.bannedUsers()){
        // treat user as anonymous
        return (perm in Forum.ForumController.anonymousPermissions());
    }
    // Right now, all "real users" are admins
    return (perm in Forum.ForumController.adminPermissions());

};

Forum.ForumController.getAllPostsDeletedByUser_Query = function(user){
    return db.forum.posts.find({deleted: user});
};

// Special ObjectIds to refer to the special "deleted" and "moderated" topics.
Forum.ForumController.specialDeletedID = ObjectId("00000000000000000000001");
Forum.ForumController.specialModeratedID = ObjectId("00000000000000000000002");
