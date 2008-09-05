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


/**
 * Utilities for blog processsing.
 * @namespace
 */
 BlogUtils = {};

/**
  *   Finds the most recent live posts.
  * @param {number} count the number of posts to find
  */
 BlogUtils.getRecentPosts = function(count) {

     var recent = db.blog.posts.find(BlogUtils.liveEntry()).sort({ts: -1}).limit(count).toArray();
     return recent;
 }

/**
  * Find all live posts
  */
 BlogUtils.getLivePosts = function() {

     var live = db.blog.posts.find(BlogUtils.liveEntry()).toArray();
     return live;
 }

 /**
  *  Finds the categories used in a blog.
  * @return {Array} the categories in alphabetical order
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

 /**
  * Returns an array of the blog's pages, not including the 404 and No Results pages.
  * @return {Array} the blog's pages
  */
BlogUtils.getPages = function(count) {
    var pages = db.blog.categories.find({cls: "page"}).sort({ts: 1}).toArray();
    return pages.filter(function(p) {
        if(p.name == "404" || p.name == "no_results")
            return false;
        return true;
    });
}

/** Checks if a given IP has been blocked.
 * @param {string} ip IP to check
 * @return {boolean} if the IP is blocked
 */
BlogUtils.isBlockedIP = function(ip) {
    if(!ip && request) ip = request.getRemoteIP();
    if ( db.blog.blocked.findOne( { ip : ip } ) )
        return true;
    return false;
}

/** Creates or augments an object representing a live, posted blog entry.
 * @param {Object} [obj={}] key/value pairs to match entries against
 * @return {Object} criteria for a post that is live, an entry (versus a page), and has been published
 */
BlogUtils.liveEntry = function(obj) {
    if(!obj) obj = {};
    obj.live = true;
    obj.cls = "entry";
    obj.ts = {"$lte" : new Date()};
    return obj;
}

 return BlogUtils;
