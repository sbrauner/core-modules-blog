
// this is what rails init starts
var useGlobal = globals;

                    
if ( ! File.open( "app" ).exists() ){
    SYSOUT( "not using an app - not starting" );
    return;
}



logger = function(){
    return log;
};

appconf = {}
var configFile = File.open( "config/config.yml" );
if ( configFile.exists() ){
    appconf = YAML.load( configFile.asString() );
}

// -------------------
// ----- plugins -----
// -------------------
Rails.loadPlugins( useGlobal , "vendor/plugins" );

// -------------------
// ----- db -----
// -------------------

Rails.schema = Rails.loadCurrentSchema();

// -------------------
// ----- libs -----
// -------------------

var inStart = true;

if ( local.config ){
    
    var files = [  "app" ];
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

var numPasses = allModelFiles.length;
for ( var pass=1; pass<=numPasses; pass++ ){

    allModelFiles.forEach( 
        function(z){
            
            if ( z._loaded )
                return;
            
            var before = scope.keySet();
            scope.setGlobal( true );
            
            try {
                z.func();
                log.rails.init.model.info( "loaded : " + z.filename );
                z._loaded = true;
            }
            catch ( e if ( pass + 1 < numPasses ) ){
                
                log.rails.init.model.info( z.filename + " failed, but ignoring " + ( pass + 1 ) + "/" + numPasses);
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
                
                useGlobal.putExplicit( name , model );
                
                if ( ! model._isModel )
                    continue;
                
                model.setConstructor( model );
                
                Rails.models.add( model );
                useGlobal.putExplicit( name , model );
                
                assert( model.find );
                assert( model.getCollectionName() );
                
                var thing = new model();
                assert( thing.name );

                assert( thing.getCollectionName() == model.getCollectionName() , "colleciton name dosn't match [" + thing.collectionName + " != " + model.collectionName  + " ]" );
                assert( model.find );

                log.rails.init.model.info( "Collection Name : " + model.getCollectionName() );
            }
            
        }
    );
}

Rails.findModel = function( thing ){
    if ( ! thing )
        throw "can't find a null model";

    if ( thing._isModel )
        return thing;

    if ( isString( thing ) ){
        for ( var i=0; i<Rails.models.length; i++){
            
            var m = Rails.models[i];
            
            if ( m.shortName == thing ||
                 m.getCollectionName() == thing ||
                 m.getSingularName() == thing )
                return m;
            
            
        }
    }
    
    throw "don't know how to find [" + thing + "] " + thing.getClass();
};

// -------------------
// ----- helpers -----
// -------------------

Rails.helpers = {};

Rails.getRubyFilesFromDir( "app/helpers/" ).forEach( 
    function(z){
        z.func();
        var little = z.filename.replace( ".rb$" , "" ).replace( "_helper$" , "" );
        var className = little.substring(0,1).toUpperCase() + little.substring(1);
        if ( z.filename.contains( "_helper" ) )
            className += "Helper";
        
        var helper = scope[ className ];
        if ( ! helper )
            throw "couldn't find [" + className + "] in [" + z.filename + "]";
        
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
