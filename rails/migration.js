
// --- Schema ---

Rails.Schema = function(){
    this.tables = {};
};

Rails.Schema.prototype.addTable = function( table ){
    this.tables[ table.name ] = table;
}

Rails.Schema.prototype.toString = function(){
    return this.tables.toString();
}

// --- Table ---

Rails.Schema.Table = function( name ){
    this.name = name;
    this.columns = {};
};

Rails.Schema.Table.prototype.column = function( name , type , options ){
    this.columns[ name ] = { type : type , options : options };
};

Rails.Schema.Table.prototype.index = function( column ){
    SYSOUT( "don't know what to do with index yet" );
};

Rails.Schema.Table.prototype.toString = function(){
    return "[ table : " + this.name + " columns : " + this.columns.keySet() + "]";
}

// --- Migratioon ---

ActiveRecord.Migration = function(){
    
};

ActiveRecord.Migration.functions = {};


ActiveRecord.Migration.functions.create_table = function( tableName , options , setup ){
    if ( isFunction( options ) ){
        setup = options;
        options = {};
    }
    assert( Rails.schema );
    var t = new Rails.Schema.Table( tableName );
    Rails.schema.addTable( t );
    setup( t );
};

ActiveRecord.Migration.functions.add_column = function( tableName , name , type , options ){
    var t = Rails.schema.tables[ tableName ];
    if ( ! t )
        throw "can't find table [" + tableName + "]";
    t.column( name , type , options );
};

ActiveRecord.Migration.functions.add_index = function( tableName , col ){
    var t = Rails.schema.tables[ tableName ];
    if ( ! t )
        throw "can't find table [" + tableName + "]";
    t.index( col );
};

ActiveRecord.Migration.functions.execute = function( sql ){
    SYSOUT( "can't execute sql [" + sql + "]" );
}

// --- main

Rails.loadCurrentSchema = function(){
    
    var schema = new Rails.Schema();
    Rails.schema = schema;

    var files = Rails.getRubyFilesFromDir( "db/migrate" );
    
    var p = /^(\d\d\d)_/;
    
    files.sort(
        function( a , b ){
            var ra = p.exec( a.filename );
            var rb = p.exec( b.filename );
            
            return parseNumber( ra[1] ) - parseNumber( rb[1] );
        }
    );

    for ( var i=0; i<files.length; i++ ){
        var f = files[i];
        var symbols = Rails.loadSymbols( f.func );

        if ( symbols.keySet().length != 1 )
            throw "bad migration files [" + f.filename + "]";
        
        var m = symbols[ symbols.keySet()[0] ];
        
        Object.extend( m.up.getScope( true ) , ActiveRecord.Migration.functions );
        m.up.call();
    }

    return schema;    
}
