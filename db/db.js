// db.js - database helper functions

/* greater than, less than qualifiers.

   example:
     db.coll.find( { name: gt("m") } );

   gte = greater than or equal (>=)
   lte = less than or equal
*/

function gt( x ){
    return { $gt : x };
}

function lt( x ){
    return { $lt : x };
}


function gte( x ){
    return { $gte : x };
}

function lte( x ){
    return { $lte : x };
}
