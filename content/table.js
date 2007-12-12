/* table.js


*/

core.content.htmlhelper();

function htmltable(specs) { 
 this.specs = specs;

 this._fields = function() { 
  var f = { };
  this.specs.cols.forEach( function(x) { f[x.name] = true } );
  return f;
 }

 this._rows = function(c) { 
   input( { name: "fieldname" } );
  tr( function() { this.specs.cols.forEach( function(x) { th(x.name) } ) } );
  tr( this.specs.cols.forEach( function(x) { td("abc") } ) );
//  c.toArray().forEach( function() { 
//   tr( function() { 
    //this.specs.cols.forEach( function(x) { 
    // td(c[x.name]); 
    //} );
//   } );
//  } );
 }

 this.dbview = function() {
  print("<table>\n");
  this._rows( this.specs.ns.find({}, this._fields()) 
  );
  print("</table>\n");
 }

}
