/* table.js

var tab = new htmltable( 
 { 
  ns : posts,
  cols : [
    { name: "title" },
    { name: "author" },
    { name: "ts" }, 
    { name: "live" }
  ],
 } 
);

*/

core.content.html2();

function htmltable(specs) { 
 this.specs = specs;

 this._colnames = function() { return this.specs.cols.map( function(x) { return x.name; } ); }

 /* returns the fields we want, as one needs them to filter them from the db */
 this._fields = function() { 
  var f = { };
  this.specs.cols.forEach( function(x) { f[x.name] = true } );
  return f;
 }

 this._rows = function(cursor) { 
     var colnames = this._colnames();

     print(colnames);
     colnames.forEach( function(x) { print("hello"); } );

     print( tr(colnames) );

     var arr = cursor.toArray();
     for( var r in arr ) {
	 print("<tr>");
	 colnames.forEach( function(col) {
		 var v = arr[r][col];
		 print("<td>");
		 if( v ) print(v);
		 print("</td>");
	     } );
	 print("</tr>\n");
     }


     //   input( { name: "fieldname" } );
     //  tr( function() { this.specs.cols.forEach( function(x) { th(x.name) } ) } );
     //  tr( this.specs.cols.forEach( function(x) { td("abc") } ) );
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
  this._rows( this.specs.ns.find({}, this._fields()) );
  print("</table>\n");
 }

}
