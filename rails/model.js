core.db.sql();

ActiveRecord = {};

ActiveRecord.Base = function( obj ){
    this.collectionName = null;
    if ( obj && isObject( obj ) )
        Object.extend( this , obj );

    
    if ( this._beforeCreate && isFunction( this[this._beforeCreate] ) )
        this[ this._beforeCreate ].call( this );
};

ActiveRecord.Base.prototype._isModel = true;

ActiveRecord.Base.prototype.setFile = function( filename ){
    this.singularName = filename.replace( /\.rb$/ , "" );
    this.collectionName = this.singularName + "s";
};

ActiveRecord.Base.prototype.setConstructor = function( cons ){
    this.theCons = cons;
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
            var s = options.conditions;
            
            if ( isObject( s ) )
                filters = s;
            else {
                if ( isArray( options.conditions ) ){
                    s = options.conditions[0];
                    for ( var i=1; i<options.conditions.length; i++ ){
                        s = s.replace( /\?/ , options.conditions[i] );
                    }
                }
                
                filters = SQL.parseWhere( s );
            }
        }
    }

    if ( type == null || type == "all" ){
    }
    else if ( "first" == type ){
        return c.findOne( filters );
    }
    else if ( isString( type ) && type.length == 24 ){
        return this._cleanOne( c.findOne( ObjectId( type ) ) );
    }
    
    return this._cleanCursor( c.find( filters ) || [] );
};

ActiveRecord.Base.prototype.find_by_sql = function( sql ){
    SYSOUT( "find_by_sql doesn't work" );
    return [];
}

ActiveRecord.Base.prototype.__notFoundHandler = function( n ){
    
    var find = false;
    var create = false;
    
    if ( n.startsWith( "find_or_create_by" ) ){
        find = true;
        create = true;
        n = n.substring( 18 );
    }
    else if ( n.startsWith( "find_by" ) ){
        find = true;
        n = n.substring( 8 );
    }
    
    if ( find ){
        var s = n.substring( 18 );
        return function( z ){
            var options = { conditions : {} };
            options.conditions[s] = z;
            var res = this.find( "first" , options );

            if ( res || ! create )
                return res;

            res = new this.theCons();
            res[s] = z;
            return res;
        }
    }
    
}

ActiveRecord.Base.prototype._checkTS = function( name ){
    if ( ! this[ name ] )
        this[name] = new Date();
}

ActiveRecord.Base.prototype.save = function(){

    var columns = Rails.schema.tables[this.collectionName].columns;
    
    var removeId = this.id == this._id;
    if ( removeId )
        delete this.id;

    for ( var c in columns ){

        var config = columns[c];
        var type = config.type;
        var options = config.options;
        
        if ( c == "created_at" || c == "created_on" ){
            this._checkTS( c );
            continue;
        }
        
        if ( c == "updated_at" || c == "updated_on" || c == "last_update" ){
            this[ c ] = new Date();
            continue;
        }
        
        if ( options ){
            if ( "default" in options && ! ( c in this ) ){
                this[c] = options["default"];
            }
        }
        
        if ( type == "integer" )
            this[c] = parseInt( this[c] );
    }

    db[this.collectionName].save( this );
    
    if ( removeId )
        this.id = this._id;
    
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
    return this.find( "all" , options ).length;
};

// ---------
// form stuff
// ---------

ActiveRecord.Base.prototype.text_area = function( name ){
    var html =
        "<textarea " +
        " id=\"" + this.singularName + "_" + name + "\" " +
        " name=\"" + this.singularName + "[" + name + "]\" " +
        " cols=\"40\" rows=\"20\" >";
    if ( this[name] )
        html += this[name];
    html += "</textarea>";
    return html;
};

ActiveRecord.Base.prototype.text_field = function( name ){
    var html =
        "<input " +
        " id=\"" + this.singularName + "_" + name + "\" " +
        " name=\"" + this.singularName + "[" + name + "]\" " +
        " size=\"30\" type=\"text\" ";
    if ( this[name] )
        html += " value=\"" + this[name].replace( /\"/g , "&quot;" ) + "\" ";
    html += "/>";
    return html;
};

ActiveRecord.Base.prototype.password_field = function( name ){
    var html =
        "<input " +
        " id=\"" + this.singularName + "_" + name + "\" " +
        " name=\"" + this.singularName + "[" + name + "]\" " +
        " size=\"30\" type=\"password\" ";
    if ( this[name] )
        html += " value=\"" + this[name].replace( /\"/g , "&quot;" ) + "\" ";
    html += "/>";
    return html;
};

ActiveRecord.Base.prototype.check_box = function( name ){
    var html =
        "<input " +
        " id=\"" + this.singularName + "_" + name + "\" " +
        " name=\"" + this.singularName + "[" + name + "]\" " +
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
        " id=\"" + this.singularName + "_" + submit + "\" " +
        " name=\"commit\" " +
        " value=\"" + name + "\" type=\"submit\" />";
};


ActiveRecord.Base.prototype.paginate = function( options ){
    return this._cleanCursor( db[ this.collectionName ].find() ) || [];
}

ActiveRecord.Base.prototype.build_search_conditions = function( options ){
    SYSOUT( "don't know how to build_search_conditions" );
    return "";
}

ActiveRecord.Base.prototype._cleanCursor = function( cursor ){
    var a = cursor.toArray();
    a.forEach( this._cleanOne );
    return a;
}

ActiveRecord.Base.prototype._cleanOne = function( o ){
    if ( ! o )
        return o;

    if ( o._id )
        o.id = o._id;
    return o;
}

// ---------
// data model
// ---------

function before_save(){
    SYSOUT( "ignoring before_save" );
}

function before_update(){
    SYSOUT( "ignoring before_update" );
}

function before_create( name ){
    this._beforeCreate = name;
}

function before_destroy(){
    SYSOUT( "ignoring before_create" );
}

function before_validation(){
    SYSOUT( "ignoring before_validation" );
}

function after_create(){
    SYSOUT( "ignoring after_create" );
}

function after_save(){
    SYSOUT( "ignoring after_save" );
}

function after_create(){
    SYSOUT( "ignoring after_create" );
}

function after_destroy(){
    SYSOUT( "ignoring after_destroy" );
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

// --------------------
// --- caching api ---
// --------------------

ActionController.Caching = {}
ActionController.Caching.Sweeper = function(){}

observe = function(){
    SYSOUT( "Sweeper.observe ignred" );
}
