// FIXME: implement a more interesting forum using a comments-on-comments system
// Right now I'm implementing this the simple "flat" way, just to get acquainted
// with the system

Forum.Post = function() {
    this.author = null;
    this.title = "";
    this.content = "";
    this.parent = null;
    this.ts = Date();
};

Forum.Post.findAllPosts = function(topic){
    return db.forum.posts.find( {parent: topic} );
};

Forum.Post.prototype.findAncestor = function(){
    var tmp = this;
    while(tmp.parent){
        tmp = tmp.parent;
    }
    return tmp;
};

Forum.Post.prototype.incrementReplies = function(){
    this.findAncestor().count += 1;
};

db.forum.posts.setConstructor(Forum.Post);
