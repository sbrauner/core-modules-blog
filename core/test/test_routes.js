
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
