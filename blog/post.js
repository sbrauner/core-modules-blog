
core.content.search();
core.text.text();

function Post() {
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
    if ( ! this.comments )
        return 0;
    
    return this.comments.length;
};

Post.prototype.deleteComment = function( num ){
    if ( this.comments )
	this.comments.remove( num );
};

Post.prototype.addComment = function( newComment ){
    if ( ! this.comments )
	this.comments = Array();
    this.comments.add( newComment );
};

Post.prototype.presave = function(){
    Search.index( this , { title : 1 } );
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
    
if ( db ){
    db.blog.posts.ensureIndex( { ts : 1 } );
    db.blog.posts.ensureIndex( { categories : 1 } );
    db.blog.posts.setConstructor( Post );

    Search.fixTable( db.blog.posts );
}
