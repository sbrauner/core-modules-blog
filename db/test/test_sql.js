core.db.sql();

assert( isNumber( SQL._parseToNumber( "5" ) ) );

t = new SQL.Tokenizer( "clicked = 1 " );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( null == t.nextToken() );


t = new SQL.Tokenizer( "clicked=1 " );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( ! t.hasMore() );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "clicked=1 and foo = 5" );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( "and" == t.nextToken() );
assert( "foo" == t.nextToken() );
assert( "=" == t.nextToken() );
var z = t.nextToken();
assert( 5 == z );
assert( isNumber( z ) );
assert( null == t.nextToken() );

f = SQL.parseWhere( "clicked = 1 " );
assert( f.clicked == 1 );

f = SQL.parseWhere( "clicked = 1 and z = 3" );
assert( f.clicked == 1 );
assert( f.z == 3 );
