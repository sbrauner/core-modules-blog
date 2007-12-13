
xml = {
    
    to : function( append , name , obj , indent ){
        if ( ! indent ) indent = 0;

        var newLine = false;

        xml.indent( append , indent );        
        append( "<" + name + ">" );
        
        if ( obj == null ){
        }
        else if ( isArray( obj ) ){
            throw "can't make arrays xml yet";
        }
        else if ( isObject( obj ) ){
            
            newLine = true;
            append( "\n" );
            for ( var prop in obj ){
                xml.to( append , prop , obj[prop] , indent + 1 );
            }
        }
        else {
            append( obj );
        }

        if ( newLine )
            xml.indent( append , indent );
        append( "</" + name + ">\n" );

    } ,
    
    indent : function( append , indent ){
        for ( var i=0; i<indent; i++ )
            append( " " );
    }

    
    
};
