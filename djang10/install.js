core.core.routes();
core.templates.djang10();

var log = log.djang10;



var invokeSandboxPackage = function(pkg_arr, target, ret) {
    // lock this lock scope as global to prevent leakage upwards    
    scope.setGlobal(true);

    // invoke the required packages
    pkg_arr.forEach(function(z) { z();});

    // invoke the target file
    target();

    // now return the element in scope that's been asked for
    return scope[ret];
};

var invokeSandboxFunction = function(pkg_arr, target, func, arg_array) {
    // lock this lock scope as global to prevent leakage upwards
    scope.setGlobal(true);

    // invoke the required packages
    pkg_arr.forEach(function(z) { z();});

    // invoke the target file
    scope.eval(target)();

    //now return the result of calling the required function
    var f = scope.eval(func);

    return f.apply(null, arg_array);
};


//determines if the given directory is an app directory - looks for __init__.jxp file in it
var isAppDir = function(z) {
    return z.listFiles().filter(function(z) { return z.getName() == "__init__.jxp";}).length > 0;
};
//returns a list of all app directories for this django app
var getAppDirs = function() {
    return openFile("/").listFiles().filter(function(z) { return z.isDirectory() && isAppDir(z) });
};

var prepModelForApp = function( appDir , appScope ) {
    log("prepping model for app " + appDir.getName());

    var prev = scope.keySet();

    scope.setGlobal( true );
    local[appDir.getName()].models();

    for ( var i in scope ){
        if ( prev.contains( i ) )
            continue;
        log( "added class " + i + " to scope.  Coll is : " + db[appDir.getName()][i] + " : " + tojson(db[appDir.getName()][i]));;
        appScope[i] = scope[i];
        appScope[i].prototype.__collection = db[appDir.getName()][i];
        appScope[i].prototype.save = function() { this.__collection.save(this); }
        appScope[i].prototype.objects = {
                                            __collection : appScope[i].prototype.__collection,
            
                                            all : function() { return this.__collection.find(); }
        };
    }
};

var getProjectSettingsScope = function() {
    scope.setGlobal(true);
    
    if(local.settings != null) {
        local.settings();
    }
    
    return scope;
};

var scopebag = {};
var controllerMap= new Map();

djang10.getControllerMap = function() {
    return controllerMap;    
};


/*****************************************************************************************
 *
 *   FRAMEWORK SETUP
 *
 *   1) go find the apps (@TODO - use the settings.js file
 *   2) Create app scopes, and augment the model for each app in each scope
 *   3) find all the view files, and invoke in the app context for each
 */

var appdirs = getAppDirs();


//for each app we find, augment the model
appdirs.forEach(function(z) {
    log("Processing application : " + z.getName());

    // create a new scope for each app, and then lock it
    appscope = globals.child();
    appscope.setGlobal(true);
    scopebag[z.getName()] = appscope;

    // now agument the model for the scope in the context of the scope
    prepModelForApp(z, appscope);
});

//now get a list of all the controllers, by getting the urlpatterns, and register them in their app scopes
//URL Mapping
if(!routes) routes = new Routes();
//get user defined url mappings
var urlpatterns = invokeSandboxPackage([core.djang10.conf.urls.defaults], jxp.urls, "urlpatterns");

for (p in urlpatterns) {
    var invoker = urlpatterns[p][1];
    var arr = invoker.split(/\./);

    //inject the view/controller into the application's scope
    var scp = scopebag[arr[1]];
    var func = arr[arr.length-1];

    if(scp == null) {
        log.error("Found dead url mapping: "+ urlpatterns[p])
        continue;        
    }

    var pkg = "local." + arr.slice(1 , -1).join(".");

    log("Found pattern invoker :" + invoker + " : app = " + arr[1]
            + " : apppkg = " + pkg + " : func = " + func + " : pattern = " + urlpatterns[p][0] + " : "  + scp);;
    
    scp.eval(pkg + "()");

    djang10.getControllerMap().set(urlpatterns[p][0], { f : func, s : scp });
    
    
    //reroute the url through the mapper 
    routes.add(urlpatterns[p][0], "~~/djang10/mapper.jxp");
    
}

//Get the users settings
var settings = getProjectSettingsScope();

var templateRoots = settings.TEMPLATE_DIRS || [];
for(var i=0; i<templateRoots.length; i++) {
    djang10.addTemplateRoot(templateRoots[i]);
}
log("Template Roots: " + tojson(templateRoots));


log("Install Done");
return djang10;
