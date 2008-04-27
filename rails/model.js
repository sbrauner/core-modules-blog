
ActiveRecord = {};

ActiveRecord.Base = function(){
    
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype._checkReady = function(){
    if ( ! this.collectionName )
        throw "need collectionName";
};

ActiveRecord.Base.prototype.setFile = function( filename ){
    this.collectionName = filename.replace( /\.rb$/ , "" );
};

ActiveRecord.Base.prototype.find = function( filter ){
    this._checkReady();
    
    var jsFilter = {};
    if ( filter == "all" ){
    }
    
    return db[ this.collectionName ].find();
};


// form stuff

ActiveRecord.Base.prototype.text_area = function( name ){
    return "text field for (" + name + ")";
};

