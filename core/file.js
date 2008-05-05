/* local source code filesystem access

   Normally you want to put your files in the database -- see f.jxp

   Note: subject to change, temp implementation.
*/

File = {};

/* creates a virtual file object, with content.  later you can write it out with 
   the writeToLocalFile() method.
*/
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