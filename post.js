
/**
*      Copyright (C) 2008 10gen Inc.
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

core.content.search();
core.text.text();
core.media.image();
core.util.timeoutcache();
core.ext.getlist();

/** @constructor Creates a new blog post
 * @param {string} name The URL at which the post can be found
 * @param {string} title Post title
 * @docmodule module.blog.post
 */
function Post(name, title) {
    this.name = name;
    this.title = title;
    this.commentsEnabled = true;
    this.ts = new Date();
    this.cls = "entry";
    this.content = "";
    this.views = 0;
    this.categories = new Array();
    this._frozen = {};
    this._free = {};
};

Post.prototype._dontEnum = true;

/** Fields: title, author, content, and excerpt
 * @type Object
 */
Post.prototype.SEARCH_FIELDS = { title : 1 , author : 1  , content : .2, excerpt : .2 };
Post.prototype.SEARCH_OPTIONS = { stripHTML : true };

/** Get a substring of this post's content, up to the first instance of "---JUMP---".
 * @return A substring of this post's content.
 */
Post.prototype.getTeaserContent = function(){
    return djang10.mark_safe( this.content.replace( /---JUMP---.*/m , "" ) );
};

/** Clean and return the full content.  Cleaning involves removing "---JUMP---" if this post's content contains the string and making sure that the size of images is not too large.
 * @return {string} Cleaned content.
 */
Post.prototype.getFullContent = function(){
    var html = this.content.replace( /---JUMP---[\r\n]*/ , "" );
    html = Media.Image.giveIMGTagsURLMaxes( html );
    return djang10.mark_safe( html );
};

/**
 * Check whether a field of this post is frozen.
 * @param {string} field the name of the field to check
 * @return {boolean} true if this field is frozen
 */
Post.prototype.isFieldFrozen = function(field){
    return field in this._frozen;
};

/**
 * Mark a field as frozen.
 * @param {string} field the name of the field to freeze
 */
Post.prototype.freezeField = function(field){
    this._frozen[field] = true;
};

/**
 * Mark a field as no longer frozen.
 * @param {string} field the name of the field to unfreeze
 */
Post.prototype.unfreezeField = function(field){
    delete this._frozen[field];
};

/**
 * Check whether a field of this post is freeform.
 * @param {string} field the name of the field to check
 * @return {boolean} true if this field is freeform
 */
Post.prototype.isFieldFreeform = function(field){
    return field in this._free;
};

/**
 * Mark a field as freeform.
 * @param {string} field the name of the field to mark
 */
Post.prototype.markFieldFreeform = function(field){
    this._free[field] = true;
};

/**
 * Mark a field as no longer freeform.
 * @param {string} field the name of the field to mark
 */
Post.prototype.unmarkFieldFreeform = function(field){
    delete this._free[field];
};

/**
 * Fetch some kind of content for this post.
 * @param {boolean} full true means the full content; false means the teaser
 * @return {string} some kind of content
 */
Post.prototype.getContent = function( full ){
    if ( full )
        return this.getFullContent();
    return this.getTeaserContent();
};

/**
 * Check whether a post has a jump and whether there's any content afterwards.
 * @return {boolean} true if there are at least 20 characters after the JUMP
 *   marker
 */
Post.prototype.hasJump = function(){

    var idx = this.content.indexOf( "---JUMP---" );

    if ( idx < 0 ) return false;

    idx = idx + 10;

    return ( idx + 10 ) < this.content.length;
};

/**
 * Get the number of comments on this post made since the given time.
 * @param {Date} when the time to check against
 * @return {number} the number of comments made since the given Date
 */
Post.prototype.getNumCommentsSince = function( when ){
    if ( ! when )
        return this.getNumComments();

    var c = this.getComments();
    if ( ! c )
        return 0;

    var num = 0;
    for ( var i=0; i<c.length; i++ ){
        if ( c[i].ts < when ){
            continue;
        }
        num++;
    }
    return num;
}

/**
 * Return the number of comments that have been made on this post.
 * @return {number} the number of comments this post has
 */
Post.prototype.getNumComments = function(){
    if ( !this.comments )
        return 0;

    if ( isArray( this.comments ) )
        return this.comments.length;

    var numComments = 0;
    for (var key in this.comments) {
        if (key == 'length') continue;
        numComments++;
    }
    return numComments;
};

/**
 * Delete comment with the given id from this post.
 */
Post.prototype.deleteComment = function(cid){
    var l = log.blog.post.deleteComment;
    l.debug( cid );

    if ( ! this.comments ){
        l.debug( "no comments" );
        return;
    }

    if ( ! isArray( this.comments ) )
        this.getComments();

    if ( isArray( this.comments ) ){
        l.debug( "array version" );
        this.comments = this.comments.filter( function(z){
                return z.cid.toString() != cid.toString();
            } );
        return;
    }

    l.debug( "old object thing" );
    delete this.comments[cid];
};

/**
 * Add the given comment to this post.
 * @param {Comment} comment a comment
 */
Post.prototype.addComment = function( comment ){

    if ( ! this.comments )
        this.comments = [];

    comment.text = comment.text.replace(/<{1}?(?=\/?(a|i|b|strong|em|table|tr|th|td)( |>))/g,"##&##").replace(/<[^>]+>/g," ").replace(/##&##/g,"<");

    // Strip elements like <a href="...></a> (missing closing quote).
    // Leaves closing elements; that sucks but hopefully the browser can handle
    // it.
    comment.text = comment.text.replace(/<[^>]+"[^>"]+>/g, "");
    // Similarly with tags like <a href="..."</a>.
    comment.text = comment.text.replace(/<[^>]+</g, "<");

    comment.cid = ObjectID();

    if ( isArray( this.comments ) )
        this.comments.push( comment );
    else
        this.comments[comment.cid.toString()] = comment;
};

/**
 * Get the post referred to by a given comment ID.
 * @param {string} cid   the comment ID
 * @return {Comment} the comment with the given cid
 */
Post.prototype.getCommentById = function(cid){
    var commentsArray = this.getComments();
    for(var key in commentsArray){
        var comment = commentsArray[key];
        if( comment.cid == cid || comment.cid.toString() == cid )
            return commentsArray[key];
    }
};

/**
 * Get this post's comments as an array.
 * @return {Array} this post's comments
 */
Post.prototype.getComments = function() {
    if ( ! this.comments )
        return [];
    if ( isArray( this.comments ) )
        return this.comments;

    var commentsArray = Array();
    for (var key in this.comments) {
        if (key == 'length') continue;
        commentsArray.push(this.comments[key]);
    }

    // sort them by date
    commentsArray = commentsArray.sort( function (a, b) { return b.ts - a.ts; });
    this.comments = commentsArray;

    return this.comments;
};

/**
 * Presave hook for Posts.
 * Indexes this post for searching.
 */
Post.prototype.presave = function(){
    var extraFields = Ext.getlist(allowModule, 'blog', 'extraFields') || {};
    for(var key in extraFields){
        var weight = Ext.getlist(extraFields, key, 'searchWeight');
        if(weight != null)
            Post.prototype.SEARCH_FIELDS[key] = weight;
    }

    Search.index( this , this.SEARCH_FIELDS , this.SEARCH_OPTIONS );

    if(Ext.getlist(allowModule, 'blog', 'stripExcerptPTag') &&
        this.excerpt &&
       this.excerpt.startsWith("<p>") &&
       this.excerpt.endsWith("</p>")) {
        this.excerpt = this.excerpt.substring(3, this.excerpt.length - 4);
    }

};

/**
 * Gets a suitable excerpt for this post.
 * Tries the excerpt field of this post, then tries taking a snippet of the
 * content.
 * @return {string} some text appropriate as an excerpt for the post
 */
Post.prototype.getExcerpt = function(){
    if ( this.excerpt )
        return djang10.mark_safe( this.excerpt );

    var foo = this.getTeaserContent();
    if ( foo == null )
        return null;

    return djang10.mark_safe( Text.snippet( foo ) );
};

/**
 * Gets the URL for the post assuming the blog is installed at /.
 * FIXME: needs to use getBaseURL() or whatever it's called.
 * @return {string} a url suitable for accessing this post
 */
Post.prototype.getUrl = function( r ){
    if ( ! r && request )
        r = request;

    // FIXME: Hack for phantom posts. Blog module shouldn't care, but this
    // is really the most elegant fix.
    if ( this.name.startsWith('http://') ) return this.name;

    var u = r ? "http://" + r.getHeader( "Host" ) : "";
    u += "/" + this.name;

    return u;
};

/**
 * Get the next post, matching filter if any, from this one.
 * "Next" means slightly older.
 * @return {Post} a post object
 */
Post.prototype.getNextPost = function( filter ){
    var s = { live : true , cls : "entry" , ts : { $lt : this.ts } };
    if ( filter )
        Object.extend( s , filter );

    var cursor = db.blog.posts.find( s );
    cursor.sort( { ts : -1 } );
    cursor.limit( 20 );

    while ( cursor.hasNext() ){
        var p = cursor.next();
        // FIXME: Phantom post hack
        if( ! p.name.startsWith("http://") )
            return p;
    }

    return null;
};

/**
 * Get the previous post, matching filter if any, from this one.
 * "Previous" means slightly younger.
 * @return {Post} a post object
 */
Post.prototype.getPreviousPost = function( filter ){
    var s = { live : true , cls : "entry" , ts : { $gt : this.ts } };
    if ( filter )
        Object.extend( s , filter );
    var cursor = db.blog.posts.find( s );
    cursor.sort( { ts : 1 } );
    cursor.limit( 20 );

    while ( cursor.hasNext() ){
        var p = cursor.next();
        // FIXME: Phantom post hack
        if( ! p.name.startsWith("http://") )
            return p;
    }

    return null;
};

/**
 * Get a URL for a thumbnail of the first image referred to in this post.
 * If maxX and maxY are given, the URL will perform server-side
 * scaling.
 * @param {number} maxX the number of pixels wide this image should be
 * @param {number} maxY the number of pixels high this image should be
 * @return {string} a URL which will fetch this image
 */
Post.prototype.getFirstImageSrc = function( maxX , maxY ){
    if ( ! this.content )
        return null;

    if ( this.suppressImage )
        return null;

    var p = /<img[^>]+src="(.*?)"/;
    var r = p.exec( this.content );
    if ( ! r )
        return null;

    var url = r[1];

    if ( ! url.match( /f?id=/ ) )
        return null;

    if ( ( maxX || maxY ) ){
        url = url.replace( /.*f?id=/ , "/~~/f?id=" );

        if ( maxX )
            url += "&maxX=" + maxX;

        if ( maxY )
            url += "&maxY=" + maxY;
    }

    return url;
};

// This gets called before saving in posts or drafts
/**
 * Translate user-friendly plaintext into HTML in a site-specific way.
 * This method consults the allowModule.blog.format object to find translation
 * methods, saves the original plaintext in special fields, and replaces that
 * plaintext with the result of the translations.
 */
Post.prototype.format = function(){
    /* Site-specific formatting */
    var that = this;
    Object.keys(this).forEach(function(key){
        if(Ext.getlist(allowModule, 'blog', 'format', key)){
            var format = allowModule.blog.format[key];
            if(typeof format == "function")
                format = [format];
            that["_original_"+key] = that[key];
            var text = that[key];
            format.forEach(function(z){ text = z(text); });
            that[key] = text;
        }
    });
};

// This gets called during loading in post_edit and nowhere else.
// This can't be a post_load because it must not happen before rendering
// a post in a blog.
/**
 * This "untranslates" the content of a blog by restoring the plaintext fields
 * and replacing the formatted HTML versions.
 */
Post.prototype.unformat = function(){
    for(var key in this){
        if(key.startsWith("_original_")){
            this[key.replace(/^_original_/, '')] = this[key];
	}
    }
};

/**
 * Gets the category for the author who wrote this post, if any.
 * @return the category name for the category that this post's author is
 *   associated with, if any, or none otherwise
 */
Post.prototype.getAuthorCat = function(){
    if(!this.author) return null;

    var key = '__authorCat_'+this.author;
    var cat = Post.cache.get( key );
    if( cat != null ) return cat;
    var cat = db.blog.categories.findOne({author: this.author});
    if( cat != null ) cat = cat.name;
    else cat = false;
    Post.cache.add( key , cat );
    return cat;
};

/**
 * Get the 404 page, or create one if one does not exist.
 * @return {Post}
 */
Post.get404 = function() {
    http404Page = db.blog.posts.findOne({ name: '404' });
    if (!http404Page) {
        http404Page = new Post('404', '404');
        http404Page.cls = 'page';
        http404Page.live = true;
        http404Page.commentsEnabled = false;
        http404Page.dontSearch = true;
        db.blog.posts.save(http404Page);
    }
    return http404Page;
};

/**
 * Get the No Results page, or create one if one does not exist.
 * @return {Post}
 */
Post.getNoResults = function() {
    noResultsPage = db.blog.posts.findOne({ name: 'no_results' });
    if (!noResultsPage) {
        noResultsPage = new Post('no_results', 'No Results');
        noResultsPage.cls = 'page';
        noResultsPage.live = true;
        noResultsPage.commentsEnabled = false;
        noResultsPage.dontSearch = true;
        db.blog.posts.save(noResultsPage);
    }
    return noResultsPage;
};

/**
 * Cache for various costly operations.
 */
Post.cache = new TimeOutCache();

/**
 * Get the most popular posts, based on the number of views.
 * @param {number} num the number of posts to return
 * @param {number} articlesBack how many of the most recent posts to consider
 * @return {Array} an array of Post objects
 */
Post.getMostPopular = function( num , articlesBack ){

    var key = "__mostPopular_" + num + "_" + articlesBack;

    var sortFunc = function( a , b ){
            return b.views - a.views;
    };

    return Post._getMost( key , num , articlesBack , sortFunc );
};

/**
 * Get the most commented-on posts.
 * @param {number} num the number of posts to return
 * @param {number} articlesBack how many of the most recent posts to consider
 * @param {number} daysBackToCountComments how recent comments have to be to
 *   "count", specified as a number of days ago
 * @return {Array} an array of Post objects
 */
Post.getMostCommented = function( num , articlesBack , daysBackToCountComments ){

    var key = "__mostCommented_" + num + "_" + articlesBack;

    var sinceWhen = null;
    if ( daysBackToCountComments )
        sinceWhen = new Date( (new Date()).getTime() - ( 1000 * 3600 * 24 * daysBackToCountComments ) );

    var sortFunc = function( a , b ){
        if ( ! sinceWhen )
            return b.getNumComments() - a.getNumComments();
        return b.getNumCommentsSince( sinceWhen ) - a.getNumCommentsSince( sinceWhen );
    };

    return Post._getMost( key , num , articlesBack , sortFunc );
};

Post._getMost = function( key , num , articlesBack , sortFunc ){
    if ( ! key )
        throw "need to pass a key to Post._getMost";

    num = num || 10;
    articlesBack = articlesBack || 100;

    var old = [];
    var all = Post.cache.get( key , old );
    if ( all )
        return all;

    if ( old[0] )
        Post.cache.add( key , old[0] );

    all = [];

    var cursor = db.blog.posts.find( Blog.blogUtils.liveEntry() ).sort( { ts : -1 } ).limit( articlesBack );
    while ( cursor.hasNext() ){
        all.push( cursor.next() );
        all = all.sort( sortFunc );
        all = all.slice( 0 , num );
    }

    Post.cache.add( key , all );
    return all;

}

function fixComments() {

    SYSOUT('Fixing Comments!');
    cursor = db.blog.posts.find();
    // iterate through each post
    cursor.forEach(function(post) {
        // see what kind of object comments is

        if ( post.comments && ! isArray( post.comments ) ){
            SYSOUT('Converting Post ID (' + post._id + ')');
            post.comments = post.getComments();
        }

        if ( ! post.views )
            post.views = 1;

        db.blog.posts.save(post);
        SYSOUT('\tSaving Post ID (' + post._id + ')');
    });
}


Blog.submitCommentAsSpam = function(comment){
    var a = new ws.akismet.Akismet( allowModule.blog.akismet.key ,
        allowModule.blog.akismet.blogUri );

    var key = a.verifyKey();
    if( ! key ){
        return "Checking the comment with Akismet failed: invalid key."
    }

    return a.submitSpam( comment.ip, comment.useragent, comment.author, comment.text, comment.email , comment.url );
};

Blog.fixDB = function(){
    db.blog.posts.ensureIndex( { ts : 1 } );
    db.blog.posts.ensureIndex( { categories : 1 } );
    db.blog.posts.ensureIndex( { name : 1 } );

    db.blog.posts.setConstructor( Post );
    db.blog.drafts.setConstructor( Post );

    Search.fixTable( db.blog.posts , Post.prototype.SEARCH_FIELDS );

    //fixComments();
}

if ( db ){
    Blog.fixDB();
    db.createCollection('blog.failed_posts', {size: 1000000, capped: true});
}

