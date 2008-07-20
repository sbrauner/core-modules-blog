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

/*
 * utilities for blog processsing
 */
core.modules.blog.post();

 BlogUtils = {};

 /*
  *   find the most recent posts
  */
 BlogUtils.getRecentPosts = function(count) {

     var recent = db.blog.posts.find(this.liveEntry()).sort({ts: -1}).limit(count).toArray();
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

BlogUtils.getPages = function(count) {
    var pages = db.blog.categories.find({cls: "page"}).sort({ts: 1}).toArray();
    return pages.filter(function(p) {
        if(p.name == "404" || p.name == "no_results")
            return false;
        return true;
    });
}

BlogUtils.isBlockedIP = function(ip) {
    if(!ip && request) ip = request.getRemoteIP();
    if ( db.blog.blocked.findOne( { ip : ip } ) )
        return true;
    return false;
}

BlogUtils.liveEntry = function(obj) {
    if(!obj) obj = {};
    obj.live = true;
    obj.cls = "entry";
    obj.ts = {"$lte" : new Date()};
    return obj;
}

 return BlogUtils;
