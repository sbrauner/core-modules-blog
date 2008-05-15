
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


ActiveRecord.Base.prototype.find = function( filter ){
    assert( this.collectionName );

    var jsFilter = {};
    if ( filter == null || filter == "all" ){
    }
    else if ( isString( filter ) && filter.length == 24 ){
        return db[ this.collectionName ].findOne( ObjectId( filter ) );
    }

    return db[ this.collectionName ].find().toArray();
};

ActiveRecord.Base.prototype.save = function(){
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


ActiveRecord.Base.prototype.paginate = function(){
    return [];
}

ActiveRecord.Base.prototype.build_search_conditions = function( options ){
    SYSOUT( "don't know how to build_search_conditions" );
    return "";
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

function around_filter(){
    SYSOUT( "ignoring around_filter" );
}

function after_create(){
    SYSOUT( "ignoring before_create" );
}

function after_destroy(){
    SYSOUT( "ignoring before_create" );
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

function has_and_belongs_to_many( name , option ){
    SYSOUT( "ignoring has_and_belongs_to_many [" + name + "]" );
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

// ---

