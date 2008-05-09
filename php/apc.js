// apc.js

// not really done

// must be loaded in _init.js so that cache is in the server-wide scope

apc = { 
    cache: { },
    constants: { }
};

function apc_define_constants(name, c) { 
    var n = 0;
    for( var i in c ) n++;
    print("<pre>apc_define_constants " + name + " defines " + n + " constants\n");
    apc.constants[name] = c;
    return true;
}

function apc_load_constants(name) { 
    var c = apc.constants[name];
    if( c ) {
	for( i in c ) {
	    globals[i] = c[i];
	}
	return true; 
    }
    print("loadconstants returns false\n");
    return false;
}
