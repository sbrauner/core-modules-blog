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

djang10.invokeSandboxFunction = function(pkg_arr, target, func) {

    // lock this lock scope as global to prevent leakage upwards

    scope.setGlobal(true);

    // invoke the required packages

    pkg_arr.forEach(function(z) { z();});

    // invoke the target file

    print("Invokgin " + target);
    scope.eval(target)();

    //now return the result of calling the required function
    
    return scope.eval(func)();
}