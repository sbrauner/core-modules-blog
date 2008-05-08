
YAML = {};

YAML.load = function( thing ){
    if ( ! isString( thing ) )
        throw "load needs a string";
    
    var map = {};

    thing.split( /[\r\n]+/ ).forEach( 
        function(line){
            line = line.trim();
            var idx = line.indexOf( ":" );
            if ( idx < 0 )
                return;
            var name = line.substring( 0 , idx ).trim();
            var value = line.substring( idx + 1 ).trim();
            map[name] = value;
        }
    );
    
    return map;
};
