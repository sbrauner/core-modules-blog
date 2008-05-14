/*
 * utilities for blog processsing
 */
 
 BlogUtils = {};
 
 /*
  *   find the most recent posts
  */
 BlogUtils.getRecentPosts = function(count) { 
	var recent = db.blog.posts.find({live: true, cls: "entry"}).sort({ts: -1}).limit(count).toArray();
 	return recent;
 }

/*
 *  find the categories
 */
 
 BlogUtils.getCategories = function() { 
	var categories = db.blog.categories.find().sort({label: 1}).toArray();

	// Now, it would be lovely if the sort above actually worked, but it doesn't because
	// db sort doesn't work on non-indexed fields yet.  So, for now, we'll manually sort
	// the array.
	categories.sort(function(a,b) {
	    // defense against the dark npe
	    var err;
	    if(!a && !b) err = 0; if(!a) err = -1; if(!b) err = 1;
	    if(!a.label && !b.label) err = 0; if(!a.label) err = -1; if(!b.label) err = 1;
	    if(err) { Blog.log.error("db.blog.categories is messed up... some category is null/has a null label"); return err; }
	
	    if(a.label > b.label) return 1;
	    else if(a.label < b.label) return -1;
	    else return 0;
	});

	return categories; 	
 }
 
 return BlogUtils;