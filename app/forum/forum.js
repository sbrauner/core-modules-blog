Forum.ForumController = {};

Forum.ForumController.bannedUsers = function(){
    return {};
};

Forum.ForumController.anonymousPermissions = function(){
    return {viewTopicNonHidden: true, viewThreadNonHidden: true};
};

Forum.ForumController.userPermissions = function(){
    return {}; // plus anonymousPermissions
};

Forum.ForumController.moderatorPermissions = function(){
    var p = {viewSpecialTopic_Moderated: true}; // plus userPermissions
    var up = Forum.ForumController.userPermissions();
    for(var i in up){
        p[i] = up[i];
    }
    return p;
};

Forum.ForumController.adminPermissions = function(){
    var p = {banUser: true, banIP: true, editPost: true, deletePost: true,
        createTopic: true, renameTopic: true, moveTopic: true, deleteTopic: true,
        hideTopic: true,
        viewSpecialTopic_Deleted: true};
    var mp = Forum.ForumController.moderatorPermissions();
    for(var i in mp){
        p[i] = mp[i];
    }
    return p; // plus moderator permissions
};



Forum.ForumController.hasPermission = function(user, perm){
    if(user == null || user in Forum.ForumController.bannedUsers()){
        // treat user as anonymous
        return (perm in Forum.ForumController.anonymousPermissions());
    }
    // Right now, all "real users" are admins
    return (perm in Forum.ForumController.adminPermissions());

};

Forum.ForumController.getDeletedPosts = function(){

};

Forum.ForumController.specialDeletedID = ObjectId("00000000000000000000001");
Forum.ForumController.specialModeratedID = ObjectId("00000000000000000000002");
