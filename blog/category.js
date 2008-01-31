
function BlogCategory(){

};

if ( db ){
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
}
    