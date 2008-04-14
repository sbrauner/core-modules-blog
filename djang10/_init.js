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


djang10.isAppDir = function(z) {

    //
    // see if this is a directory
    //

    return z.listFiles().filter(function(z) { return z.getName() == "__init__.jxp";}).length > 0;
}


djang10.getAppDirs = function() {

    return openFile( "/" ).listFiles().filter(function(z) { return z.isDirectory() && djang10.isAppDir(z) });
}

djang10.prepModelForApp = function(appDir) {

    print("DJANG10 : prepping model for app " + appDir.getName());

    var modelFile = "local." + appDir.getName() + ".models";

    scope.setGlobal(true);

    scope.eval(modelFile)();

    for (i in scope) {
        print(tojson(i));
        print(scope[i].getClass());
    }

}


/*
 *  go find the apps
 */

var appdirs = djang10.getAppDirs();


appdirs.forEach(function(z) { djang10.prepModelForApp(z);});