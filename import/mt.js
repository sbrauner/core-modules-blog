
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

var db = connect( "alleyinsider" );
var jdbcDB = jdbc( "mysql://www.alleyinsider.com/alleyinsider_mt" , "dev" , "dv12" );
var baseUrl = "http://www.alleyinsider.com";

// ------

core.modules.blog.post();
core.modules.blog.category();
core.content.search();

db.blog.posts.ensureIndex( { name : 1 } );
db.blog.images.ensureIndex( { filename : 1 } );
db.blog.images.ensureIndex( { mt_id : 1 } );

var catByName = {};
var catById = {};

var res = jdbcDB.query( "SELECT * FROM mt_category " );
while ( res.hasNext() ){
    var myCat = new Category();

    var temp = db.blog.categories.findOne( { mt_id : res.category_id } );
    if ( temp ){
	myCat = temp;
    }

    myCat.mt_id = res.category_id;
    myCat.allowPings = res.category_allow_pings;
    myCat.name = res.category_basename.replace( /-/g , "_" );
    myCat.mt_class = res.category_class;
    myCat.description = res.category_description;
    myCat.label = res.category_label;
    myCat.mt_parent = res.category_parent;
    myCat.pingUrls = res.category_ping_urls;

    db.blog.categories.save( myCat );

    catByName[ myCat.name ] = myCat;
    catById[ "__" + myCat.mt_id ] = myCat;
}

var res = jdbcDB.query( "SELECT * FROM mt_entry , mt_author WHERE entry_author_id = author_id ORDER BY entry_id DESC " );

while ( res.hasNext() ){

    var myPost = new Post();

    var temp = db.blog.posts.findOne( { mt_id : res.entry_id } );
    if ( temp != null ){
        myPost = temp;
    }

    myPost.ts = res.entry_authored_on;
    if( res.entry_class == "page" )
        myPost.name = res.entry_basename;
    else
        myPost.name = myPost.ts.getFullYear() + "/" + (myPost.ts.getMonth()+1) + "/" + res.entry_basename;

    myPost.ts = res.entry_authored_on;
    print( myPost.name + "\t" + myPost.ts );

    myPost.title = res.entry_title;
    myPost.content = res.entry_text;
    if ( res.entry_text_more && res.entry_text_more.trim().length > 0 )
	myPost.content += "\n\n---JUMP---\n\n" + res.entry_text_more;
    myPost.author = res.author_nickname;
    myPost.live = res.entry_status == 2;
    myPost.cls = res.entry_class;
    myPost.baseName = res.entry_basename;
    myPost.excerpt = res.entry_excerpt;
    myPost.mt_id = res.entry_id;

    var comments = jdbcDB.query( "SELECT * FROM mt_comment WHERE comment_visible = 1 AND comment_entry_id = " + res.entry_id + " ORDER BY comment_created_on ");
    var commentCount = 0;
    myPost.comments = Object();
    while ( comments.hasNext() ){

        var c = Object();
        c.author = comments.comment_author;
        c.email = comments.comment_email;
        c.ip = comments.comment_ip;
        c.text = comments.comment_text;
        c.ts = comments.comment_created_on;
        c.cid = ObjectId();

        myPost.comments[c.cid.toString()] = c;
        commentCount = commentCount + 1;
    }
    myPost.comments.length = commentCount;

    var cats = jdbcDB.query( "SELECT category_basename FROM mt_placement , mt_category  WHERE placement_category_id = category_id AND placement_entry_id = " + res.entry_id );
    myPost.categories = Array();

    while ( cats.hasNext() )
        myPost.categories.push( cats.category_basename.replace( /-/g , "_" ) );

    if ( res.entry_class == "page" && myPost.categories.length == 1 ){
	SYSOUT( "folder" );
	SYSOUT( "\t" + myPost.name );
	myPost.name = myPost.categories[0] + "/" + res.entry_basename;
	var theCat = catByName[ myPost.categories[0] ];
	if ( theCat ){
	    var par = catById[ "__" + theCat.mt_parent ];
	    if ( par ){
		myPost.name = par.name + "/" + myPost.name;
	    }
	}

    }

    myPost.name = myPost.name.replace( /\-/g , "_" ).replace( /\/index$/ , "" );
    SYSOUT( "\t" + myPost.name );

    myPost.content = myPost.content.replace( /<img.*?src=['"](.*?)["']/g ,
                                             function( wholeTag , url ){


                                                 if ( url.match( "^/" ) )
                                                     url = baseUrl + url;
                                                 else
                                                     url = url.replace( /www.alleyinsider.com/ , "static.alleyinsider.com" ); // TODO: temp hack get rid of this else

                                                 var id = null;

                                                 var name = url.replace( /^https?:..[^\/]*/ , "" );
                                                 var img = db.blog.images.findOne( { filename : name } );
                                                 if ( ! img ){
                                                     img = { filename : name };

						     var f = null;
						     try {
                                                        f = download( url );
                                                     }
						     catch ( dlError ){
						        print( "error downloading : " + url );
							return wholeTag;
						     }
                                                     db._files.save( f );

                                                     img.fileId = f._id;
                                                     db.blog.images.save( img );

                                                 }

                                                 wholeTag = wholeTag.replace( /src=["'](.*?)['"]/ , "src=\"/~f?id=" + img.fileId + "\"" );
                                                 return wholeTag;
                                             } );

    db.blog.posts.save( myPost );
}
