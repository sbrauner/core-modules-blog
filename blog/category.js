
Category = function (name, label) {
    this.name = name || '';
    this.label = label || ''; 
    this.description = '';
    
    this.label = this.label.toLowerCase();
};

Category.prototype.getLabel = function(){
    return this.label || this.name;
};

Category.getLabel = function( name ) {
    var category = db.blog.categories.findOne( {name: name } );
    if ( category ) 
        return category.getLabel()
    return "";
};

Category.find = function( name ){
    var tab = db.blog.categories;

    var c = tab.findOne( { name : name } );
    if ( c )
	return c;
    
    c = tab.findOne( { label : name } );
    if ( c )
	return c;

    c = tab.findOne( { name : new RegExp( "^" + name + "$" ) } );
    if ( c )
	return c;

    c = tab.findOne( { label : new RegExp( "^" + name + "$" ) } );
    if ( c )
	return c;
    
    return null;
};

if (db) {
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
    
    db.blog.categories.setConstructor( Category );
}
