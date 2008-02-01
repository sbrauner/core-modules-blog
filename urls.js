
if ( ! Blog )
    Blog = {};

core.blog.post();
core.blog.category();
core.content.search();

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

Blog.handleRequest = function( request , arg ){
    if ( ! arg )
	arg = {};
    
    var posts = Array();
    var isPage = false; // page vs. post
    var pageSize = arg.limit || 15;
    var isCategorySearch = false;
    var isDateSearch = false;
    var pageNumber = 1;
    var hasMoreResults = false;
    var search = request.q;
    var uri = arg.uri || request.getURI();
    var category;

    // define a standard search, which restricts pages/posts to entries that are live, and publishDate earlier than now
    
    if ( request.q ) {
        posts = Search.search(db.blog.posts, request.q );
        posts = posts.filter( function( z ){ return z.live; } );
	posts = posts.sort( function( a , b ){ return -1 * a.ts.compareTo( b.ts ); } );
	
	var num = 0 ;
        posts = posts.filter( function( z ){ return num++ < 20; } );
    } else {
        var searchCriteria = { live : true }; // add ts filter
	var searchName;
	var entries;
	
	if( arg.filter ) {
	    Blog._addFilters( searchCriteria , arg.filter );
	}
	
        // find any paging instructions in the url
        page = uri.match(/\/page\/([0-9]*)$/);
        if (page) {
            pageNumber = parseInt(page.match(/[0-9]*$/));
	    
            // don't forget to strip out the page from the processed uri
            uri = uri.replace(page, '');
        }
	
        // process the URL
        // strip out the .html and leading and trailing slash if it exists (for MovableType URL migration)
        uri = uri.replace(/\.html$/, '').replace(/index$/, '').replace(/\/$/, '').replace(/^\//, '').replace(/-/g, '_').replace( /^(\d\d\d\d)\/0(\d)/ , "$1/$2" );
	
        //SYSOUT("base URI: " + uri);
        //SYSOUT("pageNumber: " + pageNumber);
        
        // look for a page or post with name = URL, and display it if it exists
        // TODO: look for a page or post with name = URL replacing '-' with '_', and display it if it exists
        searchCriteria.name = uri;
        var entry = db.blog.posts.findOne(searchCriteria);
        if (entry) {
            SYSOUT('found a matching ' + entry.cls);
            search = request.q;
            return {isPage: true,
                    posts: [entry],
                    isCategorySearch: isCategorySearch,
                    baseSearch: search,
                    hasMoreResults: hasMoreResults};
        }
	
        // if the URL is empty, display the home page
        if (uri == '') {
            searchCriteria = { live : true }; // FIX ME! This should remove the name criteria
	    if (arg.filter) Blog._addFilters( searchCriteria , arg.filter );
            entries = db.blog.posts.find( searchCriteria ).sort( { ts : -1 } ).limit( pageSize + 1 ).skip( pageSize * ( pageNumber - 1 ) );
        } else {
            // search categories
            searchCriteria = { live : true }; // FIX ME! This should remove the name criteria
	    if (arg.filter) Blog._addFilters( searchCriteria , arg.filter );
            searchCriteria.categories = uri;
            searchName = uri;
            entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).limit( pageSize  + 1 ).skip( pageSize * ( pageNumber - 1 ) );
            if (entries.length() > 0) {
                SYSOUT('found matching entries for category: ' + uri);
                isCategorySearch = true;
                category = db.blog.categories.findOne({ name: uri });
            } else {
                // this isn't a category search, so we just assume its a date search or partial url search
                searchCriteria = { live : true }; // FIX ME! This should remove the name criteria
    	        if (arg.filter) searchCriteria = searchCriteria.concat(arg.filter);
                searchCriteria.name = new RegExp('^' + uri.replace(/\//g, '\\/'));
                entries = db.blog.posts.find(searchCriteria).sort( { ts : -1 } ).limit( pageSize  + 1 ).skip( pageSize * ( pageNumber - 1 ) );
                if (entries) {
                    SYSOUT('found matching entries for: ' + uri);
                }
            }
        }
        
        search = uri;

        posts = entries.toArray();
//        hasMoreResults = (entries.length() > pageSize);
        if (posts.length > pageSize) {
            hasMoreResults = true;
            posts.remove(pageSize);
        }

//        SYSOUT("posts: " + posts.length);
    }

    if ( searchName && posts.length == 0 ) {
        print( "NOT FOUND: " + searchName + "<; />" );
    }   
    
    return {isPage: isPage,
            posts: posts,
            isCategorySearch: isCategorySearch,
            baseSearch: search,
            hasMoreResults: hasMoreResults,
            category: category
    };
};

Blog.handlePosts = function( request , thePost ){
    if ( request.action == "delete" ) {
	var numToDelete = parseNumber( request.num );
	thePost.deleteComment( numToDelete );
	db.blog.posts.save( thePost );
	return;
    }
    
    if ( request.addComment == "yes" ) {
	var comment = null;
	
	SYSOUT( "want to add comment" );
	
	if ( user ) {
	    comment = {};
	    comment.author = user.name;
	    comment.email = user.email;
	} else if ( request.yourname && request.yourname.trim().length != 0 && request.email && request.email.trim().length != 0 ) {
	    if ( Captcha.valid( request ) ) {
		comment = {};
		comment.author = request.yourname;
		comment.email = request.email;
	    } else {
		print( "invalid captcha response : " + request.captcha );
		return;
	    }
	}
        
	comment.ts = Date();
	comment.text = request.txt;
        
	if ( comment ) {
	    thePost.addComment( comment );
	    db.blog.posts.save( thePost );
	}
	return;
    }
};