/* table.js

Fields in the constructor specification object:

tabname: name of the table.  used in the html etc. optional if only one table on the page.
ns: namespace in the db to query
cols: column specs
  name: col name
  searchWidth:
  heading: prettier name than 'name' for col heading
  view: function that makes the value for the col pretty
  type: "boolean" for bool columns.  used by search.
detailUrl: drill down url prefix.  uses obj id (_id)
detail: function which takes object and returns detail url
searchable: if you want it searchable.

Example:

var tab = new htmltable( 
 { 
  ns : posts,
  cols : [
    { name: "title", searchWidth: 40 },
    { name: "author" },
    { name: "ts" }, 
    { name: "live", view: function(x){return x?"yes":"no";}, searchable: false }
  ],
  detailUrl: "/editPost?id=",
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

 /* returns the fields we want, as one needs them to filter them from the db
      e.g., { name:true, address:true }
 */
 this._fieldsFilter = function() { 
  f = {};
  this.specs.cols.forEach( function(x) { f[x.name] = true } );
  return f;
 }

 // returns the query object to filter by
 this._query = function(baseQuery) { 
     if( !this.specs.searchable )
	 return {};
     var q = baseQuery;
     this.specs.cols.forEach( function(x) {
	     var s = request[x.name];
	     if( s ) {
		 s = "" + s;
		 s = s.trim();
		 if( s.length > 0 ) {
		     if( x.type == "boolean" ) {
			 var val = 
			     s == "true" || s == "True" || s == "t" || s == "T" || s == "1" ||
			     (x.view && x.view(true) == s);
			 print("VAL:" + val);
			 q[x.name] = val;
		     }
		     else { 
			 try {
			     q[x.name] = RegExp(s, "i");
			 }
			 catch( e ) { 
			     print("error: Your search regular expression is not valid");
			     q[x.name] = s;
			 }
		     }
		 }
	     }
	 });
     return q;
 }

 this._rows = function(cursor) { 
     var colnames = this._colnames();
     var displaycolnames = this._displaycolnames();

     print( tr(displaycolnames, {header:true}) );

     if( this.specs.searchable ) {
	 print("<form>");
	 var first = true;
	 print( tr(this.specs.cols.map( function(x){
			 var s = "";
			 if( first ) { 
			     first = false;
			     s = '<input type="submit" value="search"> ';
			 }
			 if( x.searchable == false ) return s;
			 return s+'<input ' +
			     (request[x.name]?'value="'+request[x.name]+'" ':'') +
			     (x.searchWidth?'size="'+x.searchWidth+'" ':'') +
			     'name="'+x.name+'">';} )) );
	 print("</form>");
     }

     var arr = cursor.toArray();
     for( var r in arr ) {
	 print("<tr>");
	 for( var c in colnames ) {
	     var v = arr[r][colnames[c]];
	     print("<td>");
	     {
		 var details = c == "0" && (this.specs.detail || this.specs.detailUrl);
		 if( details ) {
		     var post = arr[r]; 
		     var durl;
		     if( this.specs.detailUrl )
			 durl = this.specs.detailUrl + arr[r]._id;
		     else
			 durl = this.specs.detail(arr[r]);
		     print('<a href="' + durl + '">');
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
 }

 this.find = function(baseQuery) { 
     return this.specs.ns.find(this._query(baseQuery||{}), this._fieldsFilter()).limit(300);
 }

 this.dbview = function(cursor) {
  print("<table>\n");
  this._rows( cursor );
  if( cursor.length() == 300 )
      print( tr(["Only first 300 results displayed."]) );
  print("</table>\n");
 }

}
