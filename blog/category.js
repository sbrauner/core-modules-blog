
Category = function (name, label) {
    this.name = name || '';
    this.label = label || ''; //should be renamed displayName
    this.description = '';
    
    this.label = this.label.toLowerCase();
};

Category.prototype.getLabel = function(label) {
    category = db.blog.categories.findOne( {name: label} );
    if (category) 
        return category.label;
    
        return '';
    
};

if (db) {
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
}
