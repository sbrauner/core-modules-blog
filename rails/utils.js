

Rails.getRubyFilesFromDir = function( name ){
    var dir = openFile( name );
    if ( ! dir.exists() )
        return [];
    
    var all = [];
    dir.listFiles().forEach( 
        function(z){

            if ( ! z.filename.endsWith( ".rb" ) )
                return;

            if ( z.filename.startsWith( "." ) )
                return;
            
            var o = {};
            
            o.filename = z.filename;
            o.shortName = z.filename.replace( /\.rb$/ , "" );
            
            var path = name + "/" + o.shortName;
            o.func = local.getFromPath( path );
            assert( o.func , o.shortName );

            all.add( o );
        }
    );
    return all;
}
