core.util.diff();

var a = "1\n2";
var b = "1\n3";

var d = Diff.diffStr(a, b);
var n = Diff.applyBackwardsStr( b , d );
assert( a == n );

var d2 = Diff.diff( a , b );
var n2 = Diff.applyBackwards( b , d2 );
assert(d2 == d);

assert(n2 == n);
assert(n2 == a);

var a = 3;
var b = 5;
var d = Diff.diffInt( a , b );
var n = Diff.applyBackwardsInt( b , d );
assert( a == n );

var d2 = Diff.diff(a, b);
var n2 = Diff.applyBackwards(b, d2);
assert(d2 == d);

print(tojson(n2));
print(tojson(n));
print(tojson(d2));
assert(n2 == n);
assert(n2 == a);

var a = new Date( 2008, 01, 03, 7, 30, 0, 0 );
var b = new Date( 2008, 01, 04, 7, 30, 0, 0 );
var d = Diff.diffDate( a , b );
var n = Diff.applyBackwardsDate( b, d );

assert( a == n );


