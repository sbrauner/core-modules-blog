
var db = connect( "alleyinsider" );
var jdbcDB = jdbc( "mysql://www.alleyinsider.com/alleyinsider_mt" , "dev" , "dv12" );
var baseUrl = "http://www.alleyinsider.com";

// ------

core.blog.post();
core.content.search();

db.blog.posts.ensureIndex( { name : 1 } );
db.blog.images.ensureIndex( { filename : 1 } );

var res = jdbcDB.query( "SELECT * FROM mt_entry , mt_author WHERE entry_author_id = author_id ORDER BY entry_id DESC " );

while ( res.hasNext() ){

    var myPost = new Post();

    myPost.ts = res.entry_authored_on;
    myPost.name = myPost.ts.getYear() + "/" + myPost.ts.getMonth() + "/" + res.entry_basename;
    var temp = db.blog.posts.findOne( { name : myPost.name } );
    if ( temp != null ){
	myPost = temp;
    }
    
    myPost.title = res.entry_title;
    myPost.content = res.entry_text + "\n\n---JUMP---\n\n" + res.entry_text_more;
    myPost.author = res.author_name;
    myPost.live = res.entry_status == 2;

    var comments = jdbcDB.query( "SELECT * FROM mt_comment WHERE comment_visible = 1 AND comment_entry_id = " + res.entry_id );
    while ( comments.hasNext() ){
        
        var c = Object();
        c.author = comments.comment_author;
        c.email = comments.comment_email;
        c.ip = comments.comment_ip;
        c.text = comments.comment_text;
        c.ts = comments.comment_created_on;

        if ( ! myPost.comments )
            myPost.comments = Array();
        myPost.comments.push( c );
    }

    var cats = jdbcDB.query( "SELECT category_basename FROM mt_placement , mt_category  WHERE placement_category_id = category_id AND placement_entry_id = " + res.entry_id );
    myPost.categories = Array();
    while ( cats.hasNext() )
        myPost.categories.push( cats.category_basename );

    myPost.content = myPost.content.replace( /<img.*?src=['"](.*?)["']/g , 
                                             function( wholeTag , url ){ 

                                                 print( wholeTag );
                                                 
                                                 if ( url.match( "^/" ) )
                                                     url = baseUrl + url;
                                                 else
                                                     url = url.replace( /www.alleyinsider.com/ , "static.alleyinsider.com" ); // TODO: temp hack
                                                 print( "\t" + url );
                                                 
                                                 var id = null;

                                                 var name = url.replace( /^https?:..[^\/]*/ , "" );
                                                 var img = db.blog.images.findOne( { filename : name } );
                                                 if ( ! img ){
                                                     img = { filename : name };

                                                     var f = download( url );
                                                     db._files.save( f );
                                                     
                                                     img.fileId = f._id;
                                                     db.blog.images.save( img );
                                                     
                                                 }
                                                 
                                                 wholeTag = wholeTag.replace( /src=["'](.*?)['"]/ , "src=\"/~f?id=" + img.fileId + "\"" );
                                                 print( wholeTag );
                                                 return wholeTag;
                                             } );

    db.blog.posts.save( myPost );
}
