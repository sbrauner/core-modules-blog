
core.blog.post();
core.blog.category();
core.blog.missingpage();
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

/* keep track of all pages that wind up as 404's */
Blog.handleMissingUri = function(uri) {
    var missingPage = new MissingPage(uri);
    db.blog.missingpages.update( missingPage , { $inc : { num : 1 } } , { upsert : true , ids : false } );

    return {isPage: true,
            posts: [Post.get404()],
            isCategorySearch: false,
            baseSearch: uri,
            hasNext: false};

};

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
        page = uri.match(/\/page\/([0-9]*)$/);
        if (page) {
            pageNumber = parseInt( page[1] );
            pageNumber = Math.max( 1, pageNumber ); // make sure we can't go below 1
            //pageNumber = Math.min( pageNumber, 20 );

            // don't forget to strip out the page from the processed uri
            uri = uri.replace( /\/page\/[0-9]*/ , '');
        }

        var extraFields = allowModule.blog.extraFields;
        var useQuery = false;

        if (request.q)
            posts = Search.search(db.blog.posts, request.q , { min : 100 , sort : { ts : -1 } } );
        else if (request.category) {
            posts = db.blog.posts.find( { categories : request.category } ).sort({ ts: -1 }).toArray();
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
                posts = db.blog.posts.find( query ).sort({ts: -1}).toArray();
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
                return z.live && z.ts <= now && ! z.dontSearch;
            };
            else resultFilter = function(z){
                return z.live && z.ts <= now;
            };
            posts = posts.filter( resultFilter );
            //sorting now done by Search
            //posts = posts.sort( function( a , b ){ return -1 * a.ts.compareTo( b.ts ); } );

            var postResults = 0;
            var pageStart = (pageNumber - 1) * pageSize;
            var pageEnd = Math.min(pageNumber * pageSize, posts.length);

            Blog.log.debug("posts: " + posts.length);

            posts = posts.filter( function( z ) {
                    postResults++
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
            var entry = db.blog.posts.findOne(searchCriteria);

            if ( ! entry && uri.match( /\/\d\d\d\d\/\d\d?\// ) ){
                searchCriteria.name = new RegExp( uri.substring( uri.lastIndexOf( "/" ) ) + "$" );
                entry = db.blog.posts.findOne(searchCriteria);
            }
            if ( ! entry && uri.match( /-/ )){
                // Some old posts were changed to have underscores in the
                // slug instead of hyphens. If we didn't find a page using the
                // given slug, try replacing the hyphens with underscores.
                searchCriteria.name = searchCriteria.name.replace(/-/g, "_");
                entry = db.blog.posts.findOne(searchCriteria);
            }

            if (entry) {
                Blog.log.debug('found a matching ' + entry.cls);

                db.blog.posts.update( { _id : entry._id } , { $inc : { views : 1 } } , { ids : false } );

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
            Blog.log.debug( "searchCriteria : " + tojson( searchCriteria ) );
            entries = db.blog.posts.find( searchCriteria ).sort( { ts : -1 } ).limit( pageSize + 1 ).skip( pageSize * ( pageNumber - 1 ) );
        }
        else if (uri.match(/^preview/)) {
            // display a preview of a post
            entries = db.blog.drafts.find( {post_id : ObjId(request.id)} );
            previewSnippet = (uri == "previewExcerpt");
            // so that the blog doesn't think this is a search
            uri = null;
        }
        else {
            // search categories
            searchCriteria.categories = uri;
            entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).limit( pageSize  + 1 ).skip( pageSize * ( pageNumber - 1 ) );

            if (entries.length() > 0) {
                Blog.log.debug('found matching entries for category: ' + uri);
                isCategorySearch = true;
                category = db.blog.categories.findOne({ name: uri });
            }
            else {
                // this isn't a category search, so we just assume its a date search or partial url search
                delete searchCriteria.categories;

                searchCriteria.name = new RegExp('^' + uri.replace(/\//g, '\\/'));
                entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).limit( pageSize  + 1 ).skip( pageSize * ( pageNumber - 1 ) );
                if (entries.length() > 0) {
                    Blog.log.debug('found matching entries for: ' + uri);
                }
            }
        }

        search = uri;
        baseSearch = uri;

        posts = entries.toArray();
        hasPrevious = pageNumber > 1;
        hasNext = entries.length() > pageSize;
        if (posts.length > pageSize) {
            hasNext = true;
            posts.remove(pageSize);
        }

        if (posts.length == 0)
            return Blog.handleMissingUri(uri);

    }
    return result;
};

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

        if ( user ) {
            comment = {};
            comment.author = user.getDisplayName();
            comment.email = user.email;
            comment.url = user.url;
            comment.user_id = user._id;
        }
        else if ( request.yourname && request.yourname.trim().length != 0 && request.email && request.email.trim().length != 0 ) {
            if ( !Captcha )
                core.user.captcha();

            if ( Captcha.valid( request ) ) {
                comment = {};
                comment.author = request.yourname;
                comment.email = request.email;
                comment.url = request.url;
            }
            else {
                return "invalid captcha response : " + request.captcha;
            }
        }

        if ( comment ) {

            comment.ts = new Date();
            comment.text = request.txt;
            comment.ip = request.getRemoteIP();
            if(db.blog.blocked.find({ ip: comment.ip }).length() > 0) {
                return "System error: KP37-6";
            }

            comment.url = Blog.fixCommentURL( comment.url );
            comment.isAdmin = user && user.isAdmin ? true : false;

            thePost.addComment( comment );
            db.blog.posts.save( thePost );

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

return Blog;