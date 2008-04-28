
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
    var colName = this.collectionName;
    var html = "";

    var start = function( num ){
        return "\n<select " + 
            "  id='" + colName + "_" + name + "_" + num + "i' " + 
            " name='" + colName + "[" + name + "(" + num + "i)]'>";
    };

    var range = function( cur , begin , end  , num ){
        html += start( num );
        for ( var i=begin; i<=end; i++ ){
            html += "<option value='" + i + "' " + ( cur == i ? "selected" : "" ) + ">" + i + "</option>";
        }
        html += "</select>\n";
        
    }
    
    var curYear = (new Date()).getYear();
    range( curYear , curYear - 5 , curYear + 5 , 1 );

    range( (new Date()).getMonth() , 1 , 12 , 2 );
    range( (new Date()).getDay() , 1 , 31 , 3);

    html += " &mdash; ";

    range( (new Date()).getHourOfDay() , 1 , 59 , 4);
    html += ":";
    range( (new Date()).getMinute() , 1 , 59 , 5);
    
    return html;
};

ActiveRecord.Base.prototype.submit = function( name ){
    return "<input " + 
        " id=\"" + this.collectionName + "_" + submit + "\" " +
        " name=\"commit\" " +
        " value=\"" + name + "\" type=\"submit\" />";
};

