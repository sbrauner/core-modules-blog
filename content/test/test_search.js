
db = connect( "foo" );
t = db.tests.search;
t.remove( {} );

core.content.search();

var OPTIONS = { title : 1 , text : 0.5 };
Search.fixTable( t , OPTIONS );

o = { 
    title : "the title" ,
    text : "some content should go here title" 
};
Search.index( o , OPTIONS );
t.save( o );

Search.fixTable( t , OPTIONS );

assert( Search.search( t , "title" , { min : 1 } ).length == 1 );
assert( Search.search( t , "content" , { min : 1 } ).length == 1 );

o = { 
    title : "content test" ,
    text : "some content should go here title" 
};
Search.index( o , OPTIONS );
t.save( o );

assert( Search.search( t , "content" , { min : 1 } ).length == 1 );
assert( Search.search( t , "content" , { min : 10 } ).length == 2 );

//exit();
