
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


// Snippets testing

s1 = "hi";
query = "hi";
assert(Search.match(s1, query));

s1 = "hi";
query = "hi there";
assert(Search.match(s1, query));

s1 = "hi there";
query = "hi";
assert(Search.match(s1, query));

o1 = {  a: "hi" };
query = "hi";

results = Search.snippet(o1, query);
print(tojson(results));
assert(results.length == 1);
assert(results[0].object == o1);

// should return o1

o1 = { a : ["hi", "there"]};
query = "hi";
results = Search.snippet(o1, query);
assert(results.length == 1);
assert(results[0].object == o1);

o1 = { a : ["hi", {content: "yo"}, {content: "hey"}]};
query = "hey";
results = Search.snippet(o1, query);
assert(results.length == 1);
assert(results[0].object == o1.a[2]);

o1 = { a: ["hi", "hi there", "hey hi"]};
query = "hi";
results = Search.snippet(o1, query);
assert(results.length == 3);
assert(results[0].object == o1);
assert(results[0].text == o1.a[0]);
assert(results[1].object == o1);
assert(results[1].text == o1.a[1]);
assert(results[2].object == o1);
assert(results[2].text == o1.a[2]);
