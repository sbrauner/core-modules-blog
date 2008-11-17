
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

core.modules.blog.post();
core.modules.blog.category();
core.modules.blog.missingpage();
core.content.search();

Blog.log = log.app.blog;
Blog.log.level = log.LEVEL.ERROR;

/**
   arg ex. {  limit: 2, filter: {categories: "new_york"} } );

   takes a request and returns an object of form
   { isPage : boolean , posts : [ Post ] }
*/
Blog._addFilters = function( searchCriteria , filter ){
    if ( filter ){
        for ( var foo in filter )
            searchCriteria[foo] = filter[foo];
    }
};

/**
 * Keep track of all pages that wind up as 404's.
 * 404 data is kept in the blog.missingpages collection. This handler makes note
 * whenever a page is hit but not found.
 */
Blog.handleMissingUri = function(uri) {
    var missingPage = new MissingPage(uri);
    db.blog.missingpages.update( missingPage , { $inc : { num : 1 } } , { upsert : true , ids : false } );

    return {isPage: true,
            posts: [Post.get404()],
            isCategorySearch: false,
            baseSearch: uri,
            hasNext: false};

};

/**
 * Main handler for blog requests.
 *
 * @param {Request} request the request to handle
 * @param {Object} arg the arguments, including the following fields:<dl>
 *   <dt>homeCategory</dt><dd>The category to use if no category is present.</dd>
 *   <dt>filter</dt><dd>An object to use as filters for search results.</dd>
 *   <dt>ignoreRelevancy</dt><dd>A boolean, true if we want to sort search results by date.</dd>
 *   <dt>uri</dt><dd>The URI to process (overrides the request).</dd>
 * </dl>
 *
 * @return {Object} result an object containing the following fields: <dl>
 *   <dt>posts</dt><dd>An array of Post objects.</dd>
 *   <dt>isPage</dt><dd>A boolean, true if this request was a direct fetch for one blog post.</dd>
 *   <dt>isCategorySearch</dt><dd>A boolean, true if this request was a category search.</dd>
 *   <dt>isDateSearch</dt><dd>A boolean. (Currently never set.)</dd>
 *   <dt>baseSearch</dt><dd>FIXME</dd>
 *   <dt>hasPrevious</dt><dd>A boolean, true if this request was paginated and a previous page is available.</dd>
 *   <dt>hasNext</dt><dd>A boolean, true if this request was paginated and a next page is available.</dd>
 *   <dt>category</dt><dd>The category that this request eventually found.</dd>
 *   <dt>search</dt><dd>FIXME: Same value as baseSearch.</dd>
 *   <dt>previewSnippet</dt><dd>A boolean, true if this request is looking to preview a snippet for a post.</dd>
 *   <dt>pageNumber</dt><dd>A number representing the page of results the request is for.</dd>
 *   <dt>pageSize</dt><dd>A number representing the number of results per page.</dd>
 *   <dt>searchTerm</dt><dd>The string the request was searching for.</dd>
 *   <dt>uri</dt><dd>The URI this request was for.</dd>
 * </dl>
 */
Blog.handleRequest = function( request , arg ){
    if (!arg) arg = {};

    var result = {

        posts : [] ,
        isPage : false ,

        isCategorySearch : false ,
        isDateSearch : false ,
        baseSearch : "" ,

        hasPrevious : false ,
        hasNext : false ,

        category : null ,
        search : request.q ,
        previewSnippet : null ,

        pageNumber : 1 ,
        totalNumPosts : 1 ,
        pageSize : arg.limit || 30 ,
        searchTerm : request.q ,

        uri : arg.uri || request.getURI()
    };

    with ( result ){
        // define a standard search, which restricts pages/posts to entries that are live, and publishDate earlier than now

        // ensure that the root of the matched route is removed from the URI so we can place the
        // blog anywhere we want on our site.
        if (routes && routes.currentRoot() && routes.currentRoot().length > 1) {
            uri = uri.substring(routes.currentRoot().length);
        }

        // find any paging instructions in the url
        page = uri.match(/\/page\/([0-9]*)/);
        if (page) {
            pageNumber = parseInt( page[1] );
            pageNumber = Math.max( 1, pageNumber ); // make sure we can't go below 1
            //pageNumber = Math.min( pageNumber, 20 );

            // don't forget to strip out the page from the processed uri
            uri = uri.replace( /\/page\/[0-9]*/ , '');
        }

        var extraFields = allowModule.blog.extraFields;
        var useQuery = false;

        if (request.q) {
            posts = Search.search(db.blog.posts, request.q , { min : 100 , sort : { ts : -1 } , ignoreRelevancy : arg.ignoreRelevancy} );
        }
        else if (request.category) {
            // FIXME : need to fix search paging, then replace this
            posts = db.blog.posts.find( { categories : request.category } ).sort({ ts: -1 }).limit(200).toArray();
            isCategorySearch = true;
            category = db.blog.categories.findOne( { name: request.category } );
        }
        else if(extraFields){
            var query = {};
            for(var key in extraFields){
                if(extraFields[key].searchFunction)
                    extraFields[key].searchFunction(request, query);
            }
            if(Object.keys(query).length > 0){
                // FIXME : need to fix search paging, then replace this
                posts = db.blog.posts.find( query ).sort({ts: -1}).limit(200).toArray();
                useQuery = true;
            }
        }

        if (request.q || request.category || useQuery) {
            var now = new Date();
            // We filter dontSearch posts out of search results but not category
            // searches. This was the result of a debate between me and Paul;
            // this leaves the site admin with the power to include/declude
            // posts from category searches by removing them from categories.
            // Besides, to a user, a search and a category page are totally
            // different, meaning we'd have to make clear the link between
            // dontSearch and categories via interface, i.e. graying out
            // the category checkbox if the dontSearch item was "on", etc.
            var resultFilter;
            if (request.q) resultFilter = function(z){
                return z && z.live && z.ts <= now && ! z.dontSearch;
            };
            else resultFilter = function(z){
                return z && z.live && z.ts <= now;
            };
            posts = posts.filter( resultFilter );

            var postResults = 0;
            var pageStart = (pageNumber - 1) * pageSize;
            var pageEnd = Math.min(pageNumber * pageSize, posts.length);
            totalNumPosts = posts.length;
            Blog.log.debug("posts: " + posts.length);

            if( arg.ignoreRelevancy )
                posts = posts.sort(function( x, y ){
                    // FORCE sorting by descending timestamp, since we get
                    // from the Search code clumps which were indexed using
                    // terms of different weights.
                    return y.ts - x.ts;
                });

            posts = posts.filter( function( z ) {
                postResults++;
                return postResults > pageStart && postResults <= pageEnd;
            });

            Blog.log.debug("pageStart: " + pageStart + " pageEnd " + pageEnd );
            Blog.log.debug("postResults: " + postResults);
            Blog.log.debug("page: " + pageNumber);

            // setup result
            if ( postResults == 0 ){
                posts.push( Post.getNoResults() );
                return result;
            }

            hasPrevious = pageStart > 1;
            hasNext = postResults > pageEnd;
            return result;
        }


        var searchCriteria = { live : true , ts : { $lt : new Date() } }; // add ts filter
        var entries;

        if(arg.filter)
            Blog._addFilters( searchCriteria , arg.filter );

        // process the URL
        // strip out the .html and leading and trailing slash if it exists (for MovableType URL migration)
        uri = uri.replace(/\.(jxp|html)$/, '').replace(/index$/, '');
        uri = uri.replace(/^.rss\b/ , "" );
        uri = uri.replace(/\/$/, '').replace(/^\//, '').replace( /^(\d\d\d\d)\/0(\d)/ , "$1/$2" );

        Blog.log.debug("base URI: [" + uri + "]" );
        Blog.log.debug("pageNumber: " + pageNumber);

        // look for a page or post with name = URL, and display it if it exists.
        if ( uri.length != 0 ){
            searchCriteria.name = uri;
            Blog.log.debug( "searchCriteria : " + tojson( searchCriteria ) );
            var entry = Blog.PostProxy.findOne(searchCriteria);

            if ( ! entry && uri.match( /\/\d\d\d\d\/\d\d?\// ) ){
                searchCriteria.name = new RegExp( uri.substring( uri.lastIndexOf( "/" ) ) + "$" );
                entry = Blog.PostProxy.findOne(searchCriteria);
            }
            if ( ! entry && uri.match( /-/ )){
                // Some old posts were changed to have underscores in the
                // slug instead of hyphens. If we didn't find a page using the
                // given slug, try replacing the hyphens with underscores.
                searchCriteria.name = uri.replace(/-/g, "_");
                entry = Blog.PostProxy.findOne(searchCriteria);
            }

            if (entry) {
              Blog.log.debug('found a matching ' + entry.cls);

              db.blog.posts.update( { _id : entry._id } , { $inc : { views : 1 } } , { ids : false } );

              var now = new Date();
              var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              db.analytics.author.update( { author: entry.author, day: today },
                                          { $inc: { views: 1 } },
                                          { upsert: true, ids: false } );

                isPage = true;
                posts.push( entry );
                return result;
            }

            delete searchCriteria.name;
        }

        // if the URL is empty, display the home page
        if (uri == '') {
            searchCriteria.cls = 'entry';
            if ( ! searchCriteria.categories && arg.homeCategory )
                searchCriteria.categories = arg.homeCategory; // this shouldn't be in the generic blog code, because why would you want to put this kind of limit on the home page by default?

            if ( ! searchCriteria.categories && allowModule && allowModule.blog && allowModule.blog.homeCategory )
                searchCriteria.categories = allowModule.blog.homeCategory;
            Blog.log.debug( "searchCriteria : " + tojson( searchCriteria ) );
            //entries = db.blog.posts.find( searchCriteria ).sort( { ts : -1 } ).skip( pageSize * ( pageNumber - 1 ) ).limit( pageSize );
            entries = Blog.PostProxy.find( searchCriteria , { ts : -1 } , pageNumber , pageSize );
        }
        else if (uri.match(/^preview/)) {
            // display a preview of a post
            entries = db.blog.drafts.find( {post_id : ObjId(request.id)} ).sort({ts: -1 }).limit(1);
            
            previewSnippet = (uri == "previewExcerpt");
            
            isPage = true;
            // so that the blog doesn't think this is a search
            uri = null;
        }
        else {
            // search categories
            var catName = uri;
            if (db.blog.categories.findOne({name: catName})) {
                searchCriteria.categories = catName;
                //entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).skip( pageSize * ( pageNumber - 1 ) ).limit( pageSize );
                entries = Blog.PostProxy.find( searchCriteria , { ts : -1 } , pageNumber , pageSize );
            }
            else if (db.blog.categories.findOne({name: catName.replace(/-/g, "_")})){
                // Some categories also have underscores in the slug, but links
                // persist with hyphens in them; as previously, if we don't
                // find any posts which match the category with hyphens, we
                // try using underscores instead of hyphens.
                catName = catName.replace(/-/g, "_");
                searchCriteria.categories = catName;
                //entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).skip( pageSize * ( pageNumber - 1 ) ).limit( pageSize );
                entries = Blog.PostProxy.find( searchCriteria , { ts : -1 } , pageNumber , pageSize );
            }
            
            if (entries && entries.length() > 0) {
                Blog.log.debug('found matching entries for category: ' + uri);
                isCategorySearch = true;
                category = db.blog.categories.findOne({ name: catName });
                if ( ! category )
                    category = db.blog.categories.findOne( { name: catName.toLowerCase() } );
            }
            else {
                // this isn't a category search, so we just assume its a date search or partial url search
                delete searchCriteria.categories;

                searchCriteria.name = new RegExp('^' + uri.replace(/\//g, '\\/'));
                //entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).skip( pageSize * ( pageNumber - 1 ) ).limit( pageSize );
                entries = Blog.PostProxy.find( searchCriteria , { ts : -1 } , pageNumber , pageSize );
                if (entries.length() > 0) {
                    Blog.log.debug('found matching entries for: ' + uri);
                }
            }
        }

        search = uri;
        baseSearch = uri;

        posts = entries.toArray();
        hasPrevious = pageNumber > 1;
        hasNext = entries.hasNext;

        if (posts.length > pageSize) {
            hasNext = true;
            posts.remove(pageSize);
        }

        if (posts.length == 0)
            return Blog.handleMissingUri(uri);

    }
    return result;
};

/**
 * Try to see if a comment is acceptable.
 *
 * This might include checking whether a captcha passed, hitting Akismet, etc.
 *
 * @param {Request} request   the request
 * @return {String} a response if there's a problem, null if not
 */
Blog.problemPosting = function( request , comment , user ){
    if ( allowModule && allowModule.blog && allowModule.blog.allowAnonymousPosts ){
        return null;
    }

    if ( allowModule && allowModule.blog && allowModule.blog.akismet &&
         allowModule.blog.akismet.key ){
        //if ( ! ( ws && ws.akismet && ws.akismet.Akismet ) )
        var a = new ws.akismet.Akismet( allowModule.blog.akismet.key ,
            allowModule.blog.akismet.blogUri );

        var key = a.verifyKey();
        if( ! key ){
            return "Checking the comment with Akismet failed: invalid key."
        }

        var result = a.commentCheck( comment.ip, comment.useragent, comment.author , comment.text , comment.email , comment.url );
        if( ! result ){
            if( allowModule.blog.akismet.failMessage )
                return allowModule.blog.akismet.failMessage; // FIXME: mark_safe
            return "Your comment has been rejected as spam.";
        }
        return null;
    }

    if ( !Captcha )
        core.user.captcha();
    // For historical reasons, we don't use captchas on logged-in users.
    if( ! user )
        return Captcha.problem( request );
    return "";

};

/**
 * Handle POST requests on a single post. Adding/deleting a comment happens
 * here.
 * @param {Request} request the request
 * @param {Post} thePost the post object which is being POSTed to.
 * @param {User} user the user object making the POST
 *
 * @return {String} a response suitable for sharing with the user
 */
Blog.handlePosts = function( request , thePost , user ){

    if ( user && user.isAdmin() && request.action == "delete" ) {
        thePost.deleteComment( request.cid );
        db.blog.posts.save( thePost );
        return;
    }

    if ( request.addComment == "yes" ) {
        var comment = null;

        Blog.log.debug( "want to add comment" );

        var hasYourName = request.yourname && request.yourname.trim().length != 0;
        var hasEmail = request.email && request.email.trim().length != 0;

        if( thePost.commentsEnabled == false ){
            return "Comments on this post have been closed.<br>"+content.HTML.escape(request.txt);
        }

        if ( user ) {
            comment = {};
            comment.author = user.getDisplayName();
            comment.email = user.email;
            comment.url = user.url;
            comment.user_id = user._id;

        }
        else if ( request.yourname && request.yourname.trim().length != 0 && request.email && request.email.trim().length != 0 ) {

            comment = {};
            comment.author = request.yourname;
            comment.email = request.email;
            comment.url = request.url;
        }
        else
            return "Malformed request.";

        comment.ts = new Date();
        comment.text = request.txt;
        comment.ip = request.getRemoteIP();
        comment.useragent = request.getHeader('User-Agent');
        if(db.blog.blocked.find({ ip: comment.ip }).length() > 0) {
            return "System error: KP37-6";
        }

        comment.url = Blog.fixCommentURL( comment.url );
        comment.isAdmin = user && user.isAdmin ? true : false;

        var problem = Blog.problemPosting( request , comment , user );
        if( problem ){
            log.captcha.debugsai( problem + ": " + request.getRemoteIP() + " " + tojson(request));
            db.blog.failed_posts.save( { post: thePost , comment: comment , reason: problem } );
            return problem;
        }

        if ( !request.txt ){
            log("Got an empty comment from " + tojson(request));
            return "Cannot post empty comment.";
        }

        if ( comment ) {
            thePost.addComment( comment );
            if(comment.text.trim() == ''){
                log("Got an empty comment; source was " + tojson(request.txt));
            }
            db.blog.posts.save( thePost );

            // email the post's author that there is a new post
            if(mail && thePost.comment_notify && thePost.user) {
                m = new Mail.Message( "Comment on blog post "+thePost.title,
                                      "Notification: on "+comment.ts+", a comment was posted by "+
                                      (user ? user.name : request.yourname)+
                                      " on your blog post titled "+thePost.title+
                                      ":\n\n"+comment.text);
                m.addRecipient(  thePost.user.email , "to" );
                m.send( mail );
            }

            // On success, we blank out these fields so that they don't get
            // repopulated in the form
            // FIXME: This doesn't actually work! It just appends parameters to
            // the request!
            request.txt = "";
            request.email = "";
            request.yourname = "";
            request.url = "";

            // So we set an ADDITIONAL field in the request that marks that we
            // succeeded!
            request.postSuccess = comment.cid;
            request.postSuccessNumber = thePost.getNumComments();

            return "Comment Saved";
        }

        if ( ! hasYourName )
            return "need to specify name";

        if ( ! hasEmail )
            return "need to specify email address";
    }
};

Blog.fixCommentURL = function( url ){
    if ( ! url )
        return null;

    if ( url.startsWith( "http://" ) ||
         url.startsWith( "https://" ) ||
         url.startsWith( "/" ) )
        return url;

    return "http://" + url;
}

Blog.PostProxy = {

    find : function( criteria , sort , pageNumber , pageSize , hint ){
        
        log( "doing query for " + tojson( criteria ) );
        try {
            throw 1;
        }
        catch ( e ){
            scope.currentException().printStackTrace();
        }
        
        var q = { query : criteria };
        if ( sort ) 
            q.orderBy = sort;
        
        if ( hint )
            q[ "$hint" ] = hint;

        var cursor = db.blog.posts.find( q );
        
        cursor.skip( pageSize * ( pageNumber - 1 ) );
        cursor.limit( pageSize + 1 );
        
        var arr = cursor.toArray();
        var hasNext = arr.length == pageSize + 1;
        if ( hasNext )
            arr.pop();
        
        return {
            length : function(){
                return arr.length;
            }
            ,
            toArray : function(){
                return arr;
            } ,
            hasNext : hasNext
        };
        
    } ,

    findOne : function( filter ){
        
        var coll = db.blog.posts;
        
        try {
            if ( filter.name )
                return Blog.PostProxy.applyFiltersToOne( filter , coll.findOne( { name : filter.name } ) );
        }
        catch ( e ){
            log.blog.postproxy.error( "can't handle : " + tojson( filter ) + " " + e );
        }
        
        return db.blog.posts.findOne( filter );
    } ,

    applyFiltersToOne : function( filter , post ){

        if ( ! post )
            return null;

        for ( var name in filter ){

            if ( typeof( filter[name] ) == "object" ){

                for ( var qualifier in filter[name] ){

                    if ( qualifier == "$lt" ){
                        if ( post[name] >= filter[name]["$lt"] ){
                            //log( "[" + post[name] + "] >= [" + filter[name]["$lt"] + "]" );
                            return null;
                        }
                    }
                    else if ( qualifier == "$gt" ){
                        if ( post[name] <= filter[name]["$lt"] ){
                            //log( "[" + post[name] + "] <= [" + filter[name]["$lt"] + "]" );
                            return null;
                        }
                    }
                    else {
                        throw "can't handle qualifier [" + qualifier + "]";
                    }
                    
                }

            }
            else if ( filter[name] != post[name] ){
                //log( "[" + filter[name] + "] != [" + post[name] + "]" );
                return null;
            }
        }

        return post;
    }
};

return Blog;
