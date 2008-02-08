
core.content.search();
core.text.text();

function Post(name, title) {
    this.name = name;
    this.title = title;
    this.commentsEnabled = true;
    this.ts = Date();
    this.cls = "entry";
    this.content = "";
    this.categories = new Array();
};

Post.prototype.getTeaserContent = function(){
    return this.content.replace( /---JUMP---.*/m , "" );
};

Post.prototype.getFullContent = function(){
    return this.content.replace( /---JUMP---[\r\n]*/ , "" );
};

Post.prototype.getContent = function( full ){
    if ( full )
        return this.getFullContent();
    return this.getTeaserContent();
};

Post.prototype.hasJump = function(){

    var idx = this.content.indexOf( "---JUMP---" );
    
    if ( idx < 0 ) return false;
    
    idx = idx + 10;
    
    return ( idx + 10 ) < this.content.length;
};


Post.prototype.getNumComments = function(){
    if ( !this.comments )
        return 0;
    
    var numComments = 0;
    for (var key in this.comments) {
        if (key == 'length') continue;
        numComments++;
    }
    return numComments;
};

Post.prototype.deleteComment = function(cid){
    if ( this.comments ) {
        delete this.comments[cid];
    }
};

Post.prototype.addComment = function( comment ){
    if ( !this.comments ) {
        this.comments = Object();
    }
    comment.text = comment.text.replace(/<{1}?(?=\/?(a|i|b|strong|em|table|tr|th|td)( |>))/g,"##&##").replace(/<[^>]+>/g," ").replace(/##&##/g,"<");
    comment.cid = ObjectID();
    this.comments[comment.cid.toString()] = comment;
};

Post.prototype.getComments = function() {
    if (!this.comments) return Array();
    
    var commentsArray = Array();
    for (var key in this.comments) {
        if (key == 'length') continue;
        commentsArray.push(this.comments[key]);
    }
    
    // sort them by date
    return commentsArray.sort( function (a, b) { return b.ts - a.ts; });
};

Post.prototype.presave = function(){
    Search.index( this , { title : 1 , author : 1 } );
};

Post.prototype.getExcerpt = function(){
    if ( this.excerpt )
        return this.excerpt;

    var foo = this.getTeaserContent();
    if ( foo == null )
        return null;
    
    return Text.snippet( foo );
};

Post.prototype.getUrl = function( r ){
    if ( ! r && request )
        r = request;
    
    var u = r ? "http://" + r.getHeader( "Host" ) : "";
    u += "/" + this.name;
    
    return u;
};

Post.prototype.get404 = function() {
    http404page = db.blog.posts.findOne({ name: '404' });
    if (!http404page) {
        http404page = new Post('404', '404');
        http404page.cls = 'page';
        http404page.live = true;
        db.blog.posts.save(http404page);
    }
    return http404page;    
};

function fixComments() {
SYSOUT('Fixing Comments!');
    cursor = db.blog.posts.find();
    // iterate through each post
    cursor.forEach(function(post) {
        // see what kind of object comments is
        if (post.comments) {
            if (isArray(post.comments)) {
SYSOUT('Converting Post ID (' + post._id + ')');
                // if its an array, change it to an object, and reassign all of the objects
                var convertedComments = Object();
                
                post.comments.forEach(function(comment) {
                    comment.cid = ObjectId();
                    SYSOUT('\tMigrating Comment ID (' + comment.cid + ')');
                    convertedComments[comment.cid.toString()] = comment;
                });
                
                post.comments = convertedComments;
                db.blog.posts.save(post);
SYSOUT('\tSaving Post ID (' + post._id + ')');
            } else {
SYSOUT('Post ID (' + post._id + ') already converted');
            }
        } else {
SYSOUT('Post ID (' + post._id + ') has no comments');
        }
    });
}
    
if ( db ) {
    db.blog.posts.ensureIndex( { ts : 1 } );
    db.blog.posts.ensureIndex( { categories : 1 } );
    db.blog.posts.setConstructor( Post );

    Search.fixTable( db.blog.posts );
    
//    fixComments();
}
