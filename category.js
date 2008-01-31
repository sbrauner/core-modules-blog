
function BlogCategory() {
    var name = '';
    var label = ''; //should be renamed displayName
    var description = '';
};

if (db) {
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
}

