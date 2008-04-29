
ActiveRecord = {};

ActiveRecord.Base = function( obj ){
    this.collectionName = null;
    if ( obj )
        Object.extend( this , obj );
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype.setFile = function( filename ){
    this.collectionName = filename.replace( /\.rb$/ , "" );
};

ActiveRecord.Base.prototype.setConstructor = function( cons ){
    db[ this.collectionName ].setConstructor( cons );
};

ActiveRecord.Base.prototype.find = function( filter ){
    assert( this.collectionName );
    
    var jsFilter = {};
    if ( filter == null || filter == "all" ){
    }
    else if ( isString( filter ) && filter.length == 24 ){
        return db[ this.collectionName ].findOne( ObjectId( filter ) );
    }
    
    return db[ this.collectionName ].find();
};

// ---------
// save/update/etc... stuff
// ---------

ActiveRecord.Base.prototype.save = function(){
    db[this.collectionName].save( this );
    return true;
};

ActiveRecord.Base.prototype.update_attributes = function( other ){
    Object.extend( this , other );
    return this.save();
}

// ---------
// form stuff
// ---------

ActiveRecord.Base.prototype.text_area = function( name ){
    var html = 
        "<textarea " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " cols=\"40\" rows=\"20\" >";
    if ( this[name] )
        html += this[name];
    html += "</textarea>";
    return html;
};

ActiveRecord.Base.prototype.text_field = function( name ){
    var html = 
        "<input " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " size=\"30\" type=\"text\" ";
    if ( this[name] )
        html += " value=\"" + this[name].replace( /\"/g , "&quot;" ) + "\" ";
    html += "/>";
    return html;
};

ActiveRecord.Base.prototype.check_box = function( name ){
    var html =
        "<input " + 
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " value=\"1\" type=\"checkbox\" ";
    if ( this[name] )
        html += " selected ";
    html += " />";
    return html;
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

    var touse = this[name];
    if ( ! touse )
        touse = new Date();
    
    var curYear = touse.getYear();
    range( curYear , curYear - 5 , curYear + 5 , 1 );

    range( touse.getMonth() , 1 , 12 , 2 );
    range( touse.getDay() , 1 , 31 , 3);

    html += " &mdash; ";

    range( touse.getHourOfDay() , 1 , 59 , 4);
    html += ":";
    range( touse.getMinute() , 1 , 59 , 5);
    
    return html;
};

ActiveRecord.Base.prototype.submit = function( name ){
    return "<input " + 
        " id=\"" + this.collectionName + "_" + submit + "\" " +
        " name=\"commit\" " +
        " value=\"" + name + "\" type=\"submit\" />";
};

