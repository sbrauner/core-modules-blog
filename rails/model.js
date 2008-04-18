
ActiveRecord = {};

ActiveRecord.Base = function(){
    
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype.setFile = function( filename ){
    this.collectionName = filename.replace( /\.rb$/ , "" );
};

ActiveRecord.Base.prototype.find = function( filter ){
    SYSOUT( "in ActiveRecord.Base find : " + this.collectionName + " filter [" + tojson( filter ) + "]" );
    return 17;
};


