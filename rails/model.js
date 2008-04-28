
ActiveRecord = {};

ActiveRecord.Base = function(){
    this.collectionName = null;
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype.setFile = function( filename ){
    //assert( ! ActiveRecord.Base.prototype.collectionName );
    this.collectionName = filename.replace( /\.rb$/ , "" );
    //this.collectionName = filename.replace( /\.rb$/ , "" );
};

ActiveRecord.Base.prototype.find = function( filter ){
    assert( this.collectionName );
    
    var jsFilter = {};
    if ( filter == "all" ){
    }
    
    return db[ this.collectionName ].find();
};


// form stuff

ActiveRecord.Base.prototype.text_area = function( name ){
    return "<textarea " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " cols=\"40\" rows=\"20\" ></textarea>";
};

ActiveRecord.Base.prototype.text_field = function( name ){
    return "<input " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " size=\"30\" type=\"text\" />";
};

ActiveRecord.Base.prototype.check_box = function( name ){
    return "<input " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " value=\"1\" type=\"checkbox\" />";
};

ActiveRecord.Base.prototype.datetime_select = function( name ){
    return "datetime select for (" + name + ")";
};

ActiveRecord.Base.prototype.submit = function( name ){
    return "<input " + 
        " id=\"" + this.collectionName + "_" + submit + "\" " +
        " name=\"commit\" " +
        " value=\"" + name + "\" type=\"submit\" />";
};

