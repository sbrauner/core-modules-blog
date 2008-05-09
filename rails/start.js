
// this is what rails init starts

var useGlobal = globals;

// -------------------
// ----- libs -----
// -------------------

var inStart = true;

if ( local.config ){
    
    var files = [ "app" ];
    files.forEach( 
        function(z){
            if ( local.config[z] )
                local.config[z]();
        }
    );
}

Rails.getRubyFilesFromDir( "lib" ).forEach( 
    function(z){
        log.rails.init.lib.info( "loading : " + z.shortName );
        __rrequire( z.shortName );
    }
);

// -------------------
// ----- models -----
// -------------------

Rails.models = [];

Rails.baseThis = scope.child( "Rails Scope" );

var allModelFiles = Rails.getRubyFilesFromDir( "app/models" );

allModelFiles.forEach( 
    function(z){
        
    }
);

var numPasses = allModelFiles.length;
for ( var pass=0; pass<numPasses; pass++ ){

    allModelFiles.forEach( 
        function(z){
            
            if ( z._loaded )
                return;
            
            var before = scope.keySet();
            scope.setGlobal( true );
            
            try {
                z.func();
                log.rails.init.model.info( "loaded : " + z.func );
            }
            catch ( e if ( pass + 1 < numPasses ) ){
                
                log.rails.init.model.info( z.filename + " failed, but ignoring" );
                try {
                    e.printStackTrace();
                }
                catch (e){}
                
                //return;
            }
            scope.setGlobal( false );
            
            var after = scope.keySet();
            
            for ( var i=0; i<after.length; i++){
                var name = after[i];
                if ( before.contains( name ) )
                    continue;
                
                var model = scope[ name ];
                if ( ! ( model && isObject( model ) ) )
                    continue;
                
                log.rails.init.model.info( "Added Object With Name : " + name );
                useGlobal.putExplicit( name , model );
                
                if ( ! model._isModel )
                    continue;
                
                model.prototype.setFile( z.filename );
                model.prototype.setConstructor( model );
                
                Rails.models.add( model );
                useGlobal.putExplicit( name , model );
                
                assert( model.find );
                assert( model.collectionName );
                
                var thing = new model();
                assert( thing.setFile );
                
                log.rails.init.model.info(  thing.collectionName );
                assert( thing.collectionName == model.collectionName );
                model.find();
            }
            
            z._loaded = true;
        }
    );
}


// -------------------
// ----- helpers -----
// -------------------

Rails.helpers = {};

Rails.getRubyFilesFromDir( "app/helpers/" ).forEach( 
    function(z){
        z.func();
        var little = z.filename.replace( "_helper.rb$" , "" );
        var className = little.substring(0,1).toUpperCase() + little.substring(1) + "Helper";
        
        var helper = scope[ className ];
        if ( ! helper )
            throw "couldn't find [" + className + "] in [" + shortName + "]";
        
        log.rails.init.helpers.info( "Added: [" + little + "] --> " + className );
        Rails.helpers[little] = helper;
    }
);

// -------------------
// ----- controllers -----
// -------------------

var controllersDir = openFile("app/controllers" );
if ( ! controllersDir.exists() )
    throw "you need an app/controllers directory";

Rails.controllers = [];

if ( local.app.controllers.application )
    local.app.controllers.application();

controllersDir.listFiles().forEach( 
    function(z){
        
        if ( ! z.filename.endsWith( "_controller.rb" ) )
            return;
        
        var shortName = z.filename.replace( /\.rb$/ , "" );

        var f = local.app.controllers[ shortName ];
        if ( ! f )
            throw "couldn't load controller [" + shortName + "]";

        scope.setGlobal( true );
        f();

        var shortName = z.filename.replace( /_controller.rb$/ , "" );
        var className = shortName.substring( 0 , 1 ).toUpperCase() + shortName.substring( 1 ) + "Controller";
        
        var c = scope[className];
        assert( c );
        assert( c.__magic == 17 );
        
        c.shortName = shortName;
        c.className = className;
        
        Rails.controllers.add( scope[className] );

        log.rails.init.controller.info( "added: " + className );
    }

);



// -------------------
// ----- routes -----
// -------------------

Rails.routes = new ActionController.Routing.Routes();

if ( local.config && local.config.routes ){
    Rails.routes._inInit = true;
    local.config.routes();
    Rails.routes._inInit = false;
}
