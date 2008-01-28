// db.js

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
