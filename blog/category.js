
Category = function (name, label) {
    this.name = name || '';
    this.label = label || ''; //should be renamed displayName
    this.description = '';
    
    this.label = this.label.toLowerCase();
};

Category.prototype.getLabel = function(){
    return this.label || this.name;
}
Category.getLabel = function( name ) {
    var category = db.blog.categories.findOne( {name: name } );
    if ( category ) 
        return category.getLabel()
    return "";
};

if (db) {
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
    
    db.blog.categories.setConstructor( Category );
}
