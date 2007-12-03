
core.content.search();

function Post(){

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

Post.prototype.addComment = function( newComment ){
    if ( ! this.comments )
	this.comments = Array();
    this.comments.add( newComment );
}	

Post.prototype.presave = function(){
    Search.index( this , { title : 1 } );
}

if ( db ){
    posts = db.blog.posts;
    
    posts.ensureIndex( { ts : 1 } );
    posts.ensureIndex( { categories : 1 } );
    posts.setConstructor( Post );

    //Search.fixTable( posts );
}
