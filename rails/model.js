core.db.sql();

ActiveRecord = {};

ActiveRecord.Base = function( obj ){
    this.collectionName = null;
    if ( obj && isObject( obj ) )
        Object.extend( this , obj );
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype.setFile = function( filename ){
    this.collectionName = filename.replace( /\.rb$/ , "" );
};

ActiveRecord.Base.prototype.setConstructor = function( cons ){
    db[ this.collectionName ].setConstructor( cons );
};
// ---------
// save/update/etc... stuff
// ---------


ActiveRecord.Base.prototype.sum = function( col ){
    SYSOUT( "sum not working yet" );
    return -2;
};

ActiveRecord.Base.prototype.find = function( type , options ){
    assert( this.collectionName );
    
    var c = db[ this.collectionName ];
    
    var filters = {};
    
    if ( isObject( options ) ){
        if ( options.conditions ){
            filters = SQL.parseWhere( options.conditions );
        }
    }

    if ( type == null || type == "all" ){
    }
    else if ( "first" == type ){
        return c.findOne( filters );
    }
    else if ( isString( type ) && type.length == 24 ){
        return c.findOne( ObjectId( type ) );
    }
    
    return this._clean( c.find( filters ) || [] );
};

ActiveRecord.Base.prototype._checkTS = function( name ){
    if ( ! this[ name ] )
        this[name] = new Date();
}

ActiveRecord.Base.prototype.save = function(){
    this._checkTS( "created_at" );
    this._checkTS( "created_on" );
    
    this.updated_at = new Date();
    this.updated_on = new Date();
    
    db[this.collectionName].save( this );
    return true;
};

ActiveRecord.Base.prototype.update_attributes = function( other ){
    Object.extend( this , other );
    return this.save();
};

ActiveRecord.Base.prototype.destroy = function(){

    if ( ! this._id )
        return true;

    db[this.collectionName].remove( { _id : this._id } );
    return true;
};

ActiveRecord.Base.prototype.count = function( options ){
    return -2;
};

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

ActiveRecord.Base.prototype.password_field = function( name ){
    var html =
        "<input " +
        " id=\"" + this.collectionName + "_" + name + "\" " +
        " name=\"" + this.collectionName + "[" + name + "]\" " +
        " size=\"30\" type=\"password\" ";
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

    var curYear = touse.getFullYear();
    range( curYear , curYear - 5 , curYear + 5 , 1 );

    range( touse.getMonth() , 1 , 12 , 2 );
    range( touse.getDate() , 1 , 31 , 3);

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


ActiveRecord.Base.prototype.paginate = function( options ){
    return this._clean( db[ this.collectionName ].find() ) || [];
}

ActiveRecord.Base.prototype.build_search_conditions = function( options ){
    SYSOUT( "don't know how to build_search_conditions" );
    return "";
}

ActiveRecord.Base.prototype._clean = function( cursor ){
    var a = [];
    cursor.forEach( 
        function(z){
            if ( z._id )
                z.id = z._id;
            a.add( z );
        }
    );
    return a;
}



// ---------
// data model
// ---------

function before_save(){
    SYSOUT( "ignoring before_save" );
}

function before_create(){
    SYSOUT( "ignoring before_create" );
}

function before_validation(){
    SYSOUT( "ignoring before_validation" );
}

function after_create(){
    SYSOUT( "ignoring before_create" );
}

function after_destroy(){
    SYSOUT( "ignoring before_create" );
}

function skip_filter(){
    SYSOUT( "ignoring skip_filter" );
}

// --

function cache_sweeper(){
    SYSOUT( "ignoring cache_sweeper" );
}

function caches_formatted_page(){
    SYSOUT( "ignoring caches_formatted_page" );
}

// ----

function belongs_to( name ){
    SYSOUT( "ignoring belongs_to [" + name + "]" );
}

function has_many( name ){
    this[name] = [];
    SYSOUT( "ignoring has_many [" + name + "]" );
}

function has_one(){
    SYSOUT( "ignoring has_one" );
}

function has_and_belongs_to_many( name , option ){
    SYSOUT( "ignoring has_and_belongs_to_many [" + name + "]" );
}

function has_attachment(){
    SYSOUT( "ignoring has_attachment" );
}

// -----

function format_attribute( name ){
    SYSOUT( "ignoring format_attribute [" + name + "]" );
}

function composed_of( name , options ){
    SYSOUT( "ignoring composed_of [" + name + "]" );
}

// ---

function acts_as_list( options ){
    SYSOUT( "ignoring acts_as_list [" + options + "]" );
}

function acts_as_ferret( options ){
    SYSOUT( "ignoring acts_as_ferret [" + options + "]" );
}


// --

function validates_format_of( name , options ){
    SYSOUT( "ignoring validates_format_of [" + name + "]" );
}

function validates_presence_of( name , options ){
    SYSOUT( "ignoring validates_presence_of [" + name + "]" );
}

function validates_length_of( name , options ){
    SYSOUT( "ignoring validates_length_of [" + name + "]" );
}


function validates_uniqueness_of( name , options ){
    SYSOUT( "ignoring validates_uniqueness_of [" + name + "]" );
}

function validates_confirmation_of(){
    SYSOUT( "ignoring validates_confirmation_of" );
}

function validates_numericality_of(){
    SYSOUT( "ignoring validates_numericality_of" );
}

// --

function with_options( options ){
    SYSOUT( "ignoring with_options [" + name + "]" );
}

function serialize( name ){
    SYSOUT( "ignoring serialize [" + name + "]" );
}

function helper( name ){
    SYSOUT( "ignoring helper [" + name + "]" );
}

function filter_parameter_logging(){
    SYSOUT( "ignoring filter_parameter_logging " );
}

function tz_time_attributes(){
    SYSOUT( "ignoring tz_time_attributes" );
}

// ---

