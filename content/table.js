/* table.js

Example:

var tab = new htmltable( 
 { 
  ns : posts,
  cols : [
    { name: "title" },
    { name: "author" },
    { name: "ts" }, 
    { name: "live", view: function(x){return x?"yes":"no";} }
  ],
  detail: "/editPost?id=",
 } 
);

tab.dbview( tab.find().sort({ts:-1}) );

*/

core.content.html2();

function htmltable(specs) { 
 this.specs = specs;

 this._colnames = function() { return this.specs.cols.map( function(x) { return x.name; } ); }

 this._displaycolnames = function() 
     { return this.specs.cols.map( function(x) { return x.heading?x.heading:x.name; } ); }

 // returns the fields we want, as one needs them to filter them from the db
 //   e.g., { name:true, address:true }
 this._fieldsFilter = function() { 
  f = {};
  this.specs.cols.forEach( function(x) { f[x.name] = true } );
  return f;
 }

 this._rows = function(cursor) { 
     var colnames = this._colnames();
     var displaycolnames = this._displaycolnames();

     print( tr(displaycolnames, {header:true}) );

     var arr = cursor.toArray();
     for( var r in arr ) {
	 print("<tr>");
	 for( var c in colnames ) {
	     var v = arr[r][colnames[c]];
	     print("<td>");
	     {
		 var details = c == "0" && this.specs.detail;
		 if( details ) {
		     var post = arr[r]; 
		     print('<a href="' + this.specs.detail + arr[r]["_id"] + '">');
		 }
		 var view = this.specs.cols[c].view;
		 print(view ? view(v) : v);
		 if( details ) 
		     print("</a>");
	     }
	     print("</td>");
	 }
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

 this.find = function() { 
     return this.specs.ns.find({}, this._fieldsFilter()).limit(300);
 }

 this.dbview = function(cursor) {
  print("<table>\n");
  this._rows( cursor );
  print("</table>\n");
 }

}
