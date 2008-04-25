/* amb - for "nondeterministic" programs
*/

function require(x) { 
    if( !x )
        throw "tryagain";
}

function amb(f, values) { 
    for( var i = 0; i<values.length; i++ ) { 
        try {
            var res = f(values[i]);
	    if( res ) return res;
        } catch(e if e=="tryagain") {
        }   
    }
    return null;
}

Array.prototype.amb = function(f) { return amb(f,this); };

/* Example
   Adapted from Structure and Interpretation of Computer Programs
   Abelson/Sussman/Sussman section 4.3.2

res =  [1,2,3,4,5].amb( function(baker) {
return [1,2,3,4,5].amb( function(cooper) {
return [1,2,3,4,5].amb( function(fletcher) {
return [1,2,3,4,5].amb( function(miller) {
return [1,2,3,4,5].amb( function(smith) {

    require( [baker, cooper, fletcher, miller, smith].distinct() );
    require( baker != 5 );
    require( cooper != 1 );
    require( fletcher != 5 && fletcher != 1 );
    require( miller > cooper );
    require( abs(smith-fletcher) != 1 );
    require( abs(fletcher-cooper) != 1 );

    return [['baker',baker],
	    ['cooper',cooper],
	    ['fletcher',fletcher],
	    ['miller',miller],
	    ['smith',smith]];

})})})})});

*/
