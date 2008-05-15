
djang10 = {};


djang10.invokeSandboxPackage = function(pkg_arr, target, ret) {

    // lock this lock scope as global to prevent leakage upwards
    
    scope.setGlobal(true);

    // invoke the required packages

    pkg_arr.forEach(function(z) { z();});

    // invoke the target file

    target();

    // now return the element in scope that's been asked for

    return scope[ret];
}

djang10.invokeSandboxFunction = function(pkg_arr, target, func, arg_array) {

    // lock this lock scope as global to prevent leakage upwards

    scope.setGlobal(true);

    // invoke the required packages

    pkg_arr.forEach(function(z) { z();});

    // invoke the target file

    scope.eval(target)();

    //now return the result of calling the required function

    var f = scope.eval(func);

    return f.apply(null, arg_array);
}


/**
 *  determines if the given directory is an app directory - looks for __init__.jxp file in it
 *
 */
djang10.isAppDir = function(z) {

    return z.listFiles().filter(function(z) { return z.getName() == "__init__.jxp";}).length > 0;
}


/**
 *   returns a list of all app directories for this django app
 */
djang10.getAppDirs = function() {

    return openFile("/").listFiles().filter(function(z) { return z.isDirectory() && djang10.isAppDir(z) });
}

djang10.getFunctionDuples = function(modelFile) {
    scope.setGlobal(true);

    scope.eval(modelFile)();

    var myArr = [];

    for (i in scope) {
        myArr.push({name : i, func : scope[i]});
    }

    return myArr;
}

djang10.prepModelForApp = function( appDir , appScope ) {


    log.djang10("prepping model for app " + appDir.getName());

    var prev = scope.keySet();

    scope.setGlobal( true );
    local[appDir.getName()].models();

    for ( var i in scope ){
        if ( prev.contains( i ) )
            continue;
        log.djang10( "added class " + i + " to scope.  Coll is : " + db[appDir.getName()][i] + " : " + tojson(db[appDir.getName()][i]));;
        appScope[i] = scope[i];
        appScope[i].prototype.__collection = db[appDir.getName()][i];
        appScope[i].prototype.save = function() { this.__collection.save(this); }
        appScope[i].prototype.objects = {
                                            __collection : appScope[i].prototype.__collection,
            
                                            all : function() { return this.__collection.find(); }
        };
    }
}

djang10.registerAppScope = function(appName, scp) {

    if (scopebag == null) {
        scopebag = {};
    }

    scopebag[appName] = scp;
}

djang10.retrieveAppScope = function(appName) {

    if (scopebag == null) {
        return null;
    }

    return scopebag[appName];
}

djang10.setControllerDupleForRegex = function(regex, obj) {

    if (regexMap == null) {
        regexMap = new Map();
    }

    regexMap.put(regex, obj);
}

djang10.getControllerDupleForRegex = function(regex) {

    if (regexMap == null) {
        return null;
    }

    return regexMap.get(regex);
}

djang10.getControllerMap = function() {

    if (controllerMap == null) {
        controllerMap = new Map();
    }

    return controllerMap;
}

/*****************************************************************************************
 *
 *   FRAMEWORK SETUP
 *
 *   1) go find the apps (@TODO - use the settings.js file
 *   2) Create app scopes, and augment the model for each app in each scope
 *   3) find all the view files, and invoke in the app context for each
 */

var appdirs = djang10.getAppDirs();

/*
 * for each app we find, augment the model
 */

appdirs.forEach(function(z) {

    log.djang10("Processing application : " + z.getName());

    // create a new scope for each app, and then lock it
    appscope = globals.child();
    appscope.setGlobal(true);
    djang10.registerAppScope(z.getName(), appscope);

    // now agument the model for the scope in the context of the scope
    djang10.prepModelForApp(z, appscope);
});

/*
 *  now get a list of all the controllers, by getting the urlpatterns, and register them in their app scopes
 */

var urlpatterns = djang10.invokeSandboxPackage([core.djang10.conf.urls.defaults], jxp.urls, "urlpatterns");

for (p in urlpatterns) {

    var invoker = urlpatterns[p][1];
    var arr = invoker.split(/\./);

    var scp = djang10.retrieveAppScope(arr[1]);
    var func = arr[arr.length-1];

    if(scp == null) {
        log.error("Found dead url mapping: "+ urlpatterns[p])
        continue;        
    }

    var pkg = "local." + arr.slice(1 , -1).join(".");

    log.djang10("Found pattern invoker :" + invoker + " : app = " + arr[1]
            + " : apppkg = " + pkg + " : func = " + func + " : pattern = " + urlpatterns[p][0] + " : "  + scp);;
    
    scp.eval(pkg + "()");

    djang10.getControllerMap().set(urlpatterns[p][0], { f : func, s : scp });
}
