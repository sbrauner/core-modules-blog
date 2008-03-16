
File = {};

File.create = function( content ){
    return javaCreate( "ed.js.JSInputFile" , null , null , content );
};

File.open = function( file ){
    return openFile( file );
};

File.mkdirs = function( dir ){
    var temp = File.create( "garbage" );
    temp.writeToLocalFile( dir + "/.temp" );
};