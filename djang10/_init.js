
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

djang10.prepModelForApp = function(appDir) {

    print("DJANG10 : prepping model for app " + appDir.getName());

    var modelFile = "local." + appDir.getName() + ".models";

    scope.eval(modelFile)();

    var arr = djang10.getFunctionDuples(modelFile);

    arr.forEach(function(z) { scope.eval(z.name + ".prototype.save = function() { db." +
                                         appDir.getName() + "." + z.name + ".save(this)}") });


    arr.forEach(function(z) { scope.eval(z.name + ".prototype.find = function(o) { return db." +
                                         appDir.getName() + "." + z.name + ".find(o)}") });

    arr.forEach(function(z) { scope.eval(z.name + ".prototype.objects =  {" +
                                            " all : function() { return db." + appDir.getName() + "." + z.name + ".find() }" +
                                         "}") });

    arr.forEach(function(z) {print("    augmented class " + z.name) });
}


/*
 *   APPLICATION PRE PROCESSING
 *
 *  go find the apps
 */

var appdirs = djang10.getAppDirs();

/*
 * for each app we find, augment the model
 */

appdirs.forEach(function(z) {

    djang10.prepModelForApp(z);
});


person = new Person();
//person.setName("geir");
//person.save();
print(tojson(Person.objects.all()));


