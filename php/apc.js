// apc.js

// not really done

// must be loaded in _init.js so that cache is in the server-wide scope

apc = { 
    cache: { },
    constants: { }
};

function apc_define_constants(name, c) { 
    print("<p><pre>apcdefineconstants " + name + "\n");
    throw "zz";
    print("<p><pre>apcdefineconstants " + name + "\n");
    print(tojson(c) + '\n');
    apc.constants[name] = c;
    return true;
}

function apc_load_constants(name) { 
    print("<p><pre>apcloadconstants " + name + "\n");
    print(tojson(apc.constants) + '\n');
    var c = apc.constants[name];
    if( c ) {
	c.forEach(function(x) 
		  {
		      print(x + "\n");
		      globals[x] = c[x];
		  });
	print("loadconstants returns true\n");
	return true; 
    }
    print("loadconstants returns false\n");
    return false;
}
