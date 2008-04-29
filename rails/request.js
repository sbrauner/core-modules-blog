
Rails.Params = function( request ){

    for ( var foo in request ){
        this.__add( this , foo , request[foo] );
        /*
        var r = /^(\w+)\[(.*)\]$/.exec( foo );
        if ( ! r ){
            this[foo] = request[foo];        
            continue;
        }
        
        var o = this[r[1]];
        if ( ! o ){
            o = {};
            this[r[1]] = o;
        }
        
        o[r[2]] = request[foo];
*/
    }
    
    SYSOUT( "*** " + tojson( this ) );
};

Rails.Params.prototype.__add = function( obj , name , value ){

    var r = /^(\w+)\[(.*)\]$/.exec( name );
    if ( r ){
        var o = obj[r[1]];
        if ( ! o ){
            o = {};
            obj[r[1]] = o;
        }
        this.__add( o , r[2] , value );
        return;
    }    
    
    var r = /^(\w+)\(([1-5])i\)$/.exec( name );
    if ( r ){
        var d = obj[r[1]];
        if ( ! d ){
            d = new Date();
            obj[r[1]] = d;
        }
        
        value = parseNumber( value );

        switch ( parseNumber( r[2] ) ){
        case 1: d.setYear( value ); break;
        case 2: d.setMonth( value - 1 ); break;
        case 3: d.setDate( value ); break;
        case 4: d.setHours( value ); break;
        case 5: d.setMinutes( value ); break;
        default: throw "don't know what to do with [" + name + "]";
            
        }

        return;
    }
    
    obj[name] = value;

};


