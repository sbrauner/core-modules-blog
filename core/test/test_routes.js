
core.core.routes()

// test 1

routes = new Routes();
routes.add( "a" , "/A.jxp" );
routes.b = "/B.jxp";

assert( "/A.jxp" == routes.apply( "/a" ) );
assert( "/A.jxp" == routes.apply( "/a/" ) );
assert( "/A.jxp" == routes.apply( "/a/asd" ) );
assert( null == routes.apply( "/c/a/asd" ) );
assert( "/B.jxp" == routes.apply( "/b/asd" ) );

assert( "/B.jxp" == routes.apply( "/b.asd" ) );

routes[ "b.asd" ] = "/foobar.asd";
assert( "/foobar.asd" == routes.apply( "/b.asd" ) );


routes.setDefault( "/index" );
assert( "/index" == routes.apply( "/c/a/asd" ) );

routes.setDefault( null );
assert( null == routes.apply( "/c/a/asd" ) );

routes.add( /.*\/c\/.*/ , "/abc" );
assert( "/abc" == routes.apply( "/c/a/asd" ) );

assert( null == routes.apply( "/sub/d/foo" ) );

routes.sub = new Routes();
routes.sub.d = "/eliot";
assert( "/eliot" == routes.apply( "/sub/d/foo" ) );

routes.sub = new Routes();
routes.sub.e = "funky";
assert( "/sub/funky" == routes.apply( "/sub/e/a" ) );

assert( "/sub/" == routes.apply( "/sub/asd" ) );

routes.sub.setDefault( "view" );
assert( "/sub/view" == routes.apply( "/sub/asd" ) );

// test 2

routes = new Routes();
routes.wiki = new Routes();
routes.wiki.add( /.*\.jpg$/ , "/~~/wiki/$0" );
assert( "/~~/wiki/a/1.jpg" == routes.apply( "/wiki/a/1.jpg" ) );
routes.wiki.add( /.*\.gif/ , "~~/wiki/$0" );
assert( "/wiki/~~/wiki/a/2.gif" == routes.apply( "/wiki/a/2.gif" ) );

routes.wiki.add( /\/?(.*)/ , "/~~/wiki/" , { names : [ "name" ] } );
request = {};
assert( "/~~/wiki/" == routes.apply( "/wiki/abc" , request ) );
assert( request.name == "abc" );

// test 3

routes = new Routes();
routes.wiki = new Routes();

routes.wiki.add( /(\w+)\/(\w+)/ , "/~~/wiki/" , { names : [ "action" , "value" ] } );
request = {};
assert( "/~~/wiki/" == routes.apply( "/wiki/do/4" , request ) );
assert( request.action == "do" );
assert( request.value == "4" );

// Nesting w/o regexps
routes = new Routes();
routes.forum = new Routes();
routes.forum.images = new Routes();
routes.forum.images["feed-icon16x16"] = "/~~/app/forum/images/feed-icon16x16";

var res = routes.apply('/forum/images/feed-icon16x16', null);
assert( res == "/~~/app/forum/images/feed-icon16x16" );



// ---

routes = new Routes();
routes.wiki = new Routes();

routes.wiki.add( /(\w+)\/(\w+)\/(\w+)/ , "/~~/wiki/" , { names : [ "action" , "value" , "value" ] } );
request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/" );
assert( "/~~/wiki/" == routes.apply( "/wiki/do/4/5" , request ) );
assert( request.action == "do" );
assert( request.getParameters( "value" ).length == 2 );
assert( request.getParameters( "value" )[0] == "4" );
assert( request.getParameters( "value" )[1] == "5" );

// Testing the find function

routes = new Routes();
routes.wiki = new Routes();
routes.wiki.page1 = new Routes();

assert( '/wiki' == routes.find( routes.wiki ) );
assert( '/wiki/page1' == routes.find( routes.wiki.page1 ) );

var r1 = new Routes();
routes.add(/.+/, r1);
try {
    routes.find(r1);
    print("should never get here");
} catch (e) {

}

assert(null == routes.find( new Routes() ));

routes.wiki2 = "hi";
assert(null == routes.find( new Routes() ));

routes.add(/.+/, "yo");
assert(null == routes.find( new Routes() ));


