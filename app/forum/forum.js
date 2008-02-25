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
    return {}; // plus userPermissions
};

Forum.ForumController.adminPermissions = function(){
    var p = {banUser: true, banIP: true, editPost: true, deletePost: true,
        createTopic: true, renameTopic: true, moveTopic: true, deleteTopic: true,
        hideTopic: true};
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

