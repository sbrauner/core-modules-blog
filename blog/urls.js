
if ( ! Blog )
    Blog = {};

core.blog.post();
core.content.search();

/**
arg ex. { compact: true, limit: 2, filter: {categories: "new_york"} } );

   takes a request and returns an object of form
   { isPage : boolean , posts : [ Post ] }
*/
Blog.handleRequest = function( request , arg ){
    if ( ! arg )
	arg = {};

    var thePosts = Array();
    var isPage = false; // page vs. post
    
        if ( request.q ){

        thePosts = Search.search( posts , request.q );

        thePosts = thePosts.filter( function( z ){ return z.live; } );
	thePosts = thePosts.sort( function( a , b ){ return -1 * a.ts.compareTo( b.ts ); } );

	var num = 0 ;
        thePosts = thePosts.filter( function( z ){ return num++ < 20; } );
    }
    else {
        var searchObject = { live : true };
    	var uri = request.getURI();
	var searchName;
        var index = uri.match(/^\/index/);
	if( arg.filter ) { 
	    searchObject = arg.filter;
	    searchObject.live = true;
	}
	if( !index && uri.match(/^\/[a-zA-Z]/) ) {
	    if( uri.match(/^\/sa100/) ) {
	        request.applyServletParams( /sa100\/(.+)\.html/ , [ "name" ] );
	    	searchName = request.name;
		if( searchName ) searchName = searchName.replace(/-/g, "_");
	    }
	    else if( uri.match(/..*\/$/) ) { 
	        request.applyServletParams( /\/(.+)\// , [ "name" ] );
		searchObject.categories = request.name;
		searchName = null;
	    }
	    else {
	        request.applyServletParams( /\/(.+)\.html/ , [ "name" ] );
	    	searchName = request.name;
	    }
	    isPage = true;
	}
	else {
	    request.applyServletParams( /(200\d.\d+.+)/ , [ "name" ] );
	    searchName = request.name;
	}
        
	if ( uri.match( /.index/ ) )
	    request.applyServletParams( /index-(\d+)/ , [ "page" ] );

        if ( searchName )
            searchObject.name = searchName;
	var pageSize = arg.limit || 15;
        var cursor = posts.find( searchObject ).sort( { ts : -1 } ).limit( pageSize );

	pageNumber = 1;
	if ( request.page && parseNumber( request.page ) > 0 ){
	    pageNumber = parseNumber( request.page );
	    cursor.skip( pageSize * ( pageNumber - 1 ) );
	}

        thePosts = cursor.toArray();
	if( thePosts.length )
	    isPage = thePosts[0].cls != "entry";
    }

    if ( searchName && thePosts.length == 0 ){
        print( "NOT FOUND : " + searchName + "<BR>" );
    }


    if ( searchName && thePosts.length == 1 ){

        if ( request.action == "delete" ){
	    var numToDelete = parseNumber( request.num );
            thePosts[0].deleteComment( numToDelete );
            posts.save( thePosts[0] );
        }
        
        if ( request.addComment == "yes" ){
            var newComment = null;
            
            if ( user ){
                newComment = {};
                newComment.author = user.name;
                newComment.email = user.email;
            }
            else if ( request.yourname && request.yourname.trim().length != 0 &&
                      request.email && request.email.trim().length != 0 ){
                if ( Captcha.valid() ){
                    newComment = {};
                    newComment.author = request.yourname;
                    newComment.email = request.email;
                }
                else {
                    print( "invalid captcha response : " + request.captcha );
                }
            }
            
            newComment.ts = Date();
            newComment.text = request.txt;
            
            if ( newComment ) {
                thePosts[0].addComment( newComment );
                posts.save( thePosts[0] );
            }

	}
    }
    
    return { isPage : isPage , posts : thePosts };
}