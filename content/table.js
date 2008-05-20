/* table.js

htmltable provides a means to display data from the database in table format automatically,
with some additional functionality automatically provided such as a simple search user
interface.

Fields in the constructor specification object listed below.  Most fields are optional and
have reasonable defaults.

id:             name of the table.  used in the html etc. optional if only one table on the page.
ns:             database collection object to query
searchable:     if true, search header provided and supported
cols:           array of column specifications
  name:         column name (corresponds to name of member in each database object)
  searchWidth:  width of the search input field in the heading, if using search (depreciated)
  heading:      prettier name than 'name' for col heading
  view:         function that makes the value for the column pretty
  type:         "boolean" for bool columns.  used by search.
  queryForm:    user specified function to translate, on a search, what the user typed in the
                column input field  into db query format.
                Optional; by default most things entered are converted into a case insensitive
		regular expression.
  isLink:       true or false; display this column as a link to the detail for this row.
  className:    CSS class name for this field
  searchable:   specifies if specific column is searchable.  defaults to true if table overall
                is searchable.
detailUrl:      drill down url prefix.  uses obj id (_id)
detail:         function which takes object and returns detail url.  when specified, detailUrl
                is not used.
filter:         a function, which if specified, returns true if the row from the db should be
                displayed.  You are generally better off including the condition in the query
		rather than using this client-side facility.
rowsPerPage:    number of rows displayed (default: 100)
currentPage:    current page being displayed (default: 1)
style:          the url of a stylesheet to be used instead of the default

Example:

var tab = new htmltable(
 {
  ns : db.posts,
  cols : [
    { name: "title", view: function(x){ return "<h1>"+x+"</h1>" },
    { name: "author" },
    { name: "ts" },
    { name: "live", view: function(x){return x?"yes":"no";}, searchable: false }
  ],
  detailUrl: "/post_edit?id="
 }
);

tab.dbview( tab.find().sort({ts:-1}) );

*/

core.content.html2();
core.net.url();
core.util.db();

function htmltable(specs) {
    this.specs = specs;

    this._colnames = function() { return this.specs.cols.map( function(x) { return x.name; } ); };

    this._displaycolnames = function()
    { return this.specs.cols.map( function(x) { return x.heading?x.heading:x.name; } ); };

    /* returns the fields we want, as one needs them to filter them from the db
       e.g., { name:true, address:true }
    */
    this._fieldsFilter = function() {
        f = {};
        this.specs.cols.forEach( function(x) { f[x.name] = true } );
        return f;
    };

    // returns the query object to filter by
    this._query = function(baseQuery) {
        //if( !this.specs.searchable ) return {};
        var q = baseQuery;
        this.specs.cols.forEach( function(x) {
                var s = request[x.name];
                if( s ) {
                    s = "" + s;
                    s = s.trim();
                    if( s.length > 0 ) {
                        if( x.queryForm ) {
                            var v = x.queryForm(s);
                            if( v )
                                q[x.name] = v;
                        }
                        else if( x.type == "boolean" ) {
                            var val =
                                s == "yes" || s == "y" || s == "true" || s == "True" || s == "t" || s == "T" || s == "1" ||
                                (x.view && x.view(true) == s);
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
    };

    this._sort = function(baseSort){
        baseSort = baseSort || {};
        var s = {};
        var key = false;
        this.specs.cols.forEach( function(x) {
            var sval = request["sort"+x.name];
            if(sval){
                if(sval == "d")
                    s[x.name] = -1;
                else s[x.name] = 1;
                key = true;
            }
        });
        return key ? s : baseSort;
    };

    this._rows = function(cursor) {
        var colnames = this._colnames();
        var displaycolnames = this._displaycolnames();
        var th = [];
        for(var i=0; i<colnames.length; i++) {
            if(request && request[colnames[i]]) {
                th.push({name: colnames[i], heading: displaycolnames[i], search: request[colnames[i]]});
                var searchtxt = request[colnames[i]];
            }
            else
                th.push({name: colnames[i], heading: displaycolnames[i] });
        }
        searchtxt = searchtxt ? searchtxt : "";

        var currentPage = request.currentPage || this.specs.currentPage || 1;
        var rowsPerPage = request.rowsPerPage || this.specs.rowsPerPage || 100;

        if ( this.specs.actions && this.specs.actions.length > 0 ) {
            displaycolnames.push( "Actions" );
        }

        var sort = this._sort();
        var u = new URL(request.getURL());
        for(var i in sort){
            u = u.removeArg("sort"+i);
        }

        for(var i in this.specs.cols){
            if(has_index(this.specs.ns, this.specs.cols[i].name)){
                var using = false;
                var asc = false;
                var newval = "a";
                if(request['sort'+colnames[i]] == "a"){
                    asc = true;
                    using = true;
                    newval = "d";
                }
                else if(request['sort'+colnames[i]] == "d"){
                    asc = false;
                    using = true;
                }
                var target = u.replaceArg('sort'+colnames[i], newval).toString();
                displaycolnames[i] = "<a href=\""+target+"\">"+displaycolnames[i]+ "</a>"
                    +(using?(asc?"^":"v"):"");
            }
        }
        core.content.pieces.tableHeader({th: th, colspan: displaycolnames.length, search: this.specs.searchable, current_search: searchtxt});

        var dbResult = cursor.toArray();

        var hasIsLink = false;
        this.specs.cols.forEach( function( z ){
                if ( z.isLink )
                    hasIsLink = true;
            } );


        var rows = [];
        count = 0;
        for(var i=0; i< dbResult.length; i++) {
            var obj = dbResult[i];
            if( this.filter && !this.filter(obj) ) continue;

            rows[count] = {};
            if(!colnames) break;
            for( var c in colnames ) {

                var fieldValue = obj[colnames[c]]
                var isLink = this.specs.cols[c].isLink;
                var cssClassName = this.specs.cols[c].cssClassName;

                if(cssClassName) {
                    rows[count][colnames[c]].className = cssClassName;
                }

                rows[count][colnames[c]] = { value: "" };
                {
                    var linkToDetails =  ( isLink || ( c == "0" && ! hasNext ) )  && (this.specs.detail || this.specs.detailUrl);
                    if( linkToDetails ) {
                        var post = obj;
                        var fieldUrl;

                        if( this.specs.detailUrl ) fieldUrl = this.specs.detailUrl + obj._id;
                        else fieldUrl = this.specs.detail(obj);

                        rows[count][colnames[c]].value += '<a href="' + fieldUrl + '">';
                    }
                    var viewMethod = this.specs.cols[c].view;
                    var fieldDisplay = viewMethod ? viewMethod(fieldValue, obj) : fieldValue;
                    rows[count][colnames[c]].value += fieldDisplay || ( linkToDetails ? "(go to)" : "" );
                    if( linkToDetails ) rows[count][colnames[c]].value += "</a>";
                }
            }
            count++;
        }

        if ( this.specs.actions && this.specs.actions.length != 0){
            var acts = "";
            colnames.push( "actions" );
            th.push({ heading: "Actions" });
            for(var count=0; count<rows.length; count++) {
                for ( var i=0; i<this.specs.actions.length; i++ ){
                    obj = dbResult[count];
                    var action = this.specs.actions[i];
                    acts += "<form method='post'>" ;
                    acts += "<input type='hidden' name='_id' value='" + obj._id + "'>" ;
                    acts += "<input type='submit' name='action' value='" + action.name + "'>" ;
                    acts += "</form>" ;
                }
                rows[count]["actions"] = ({value: acts});
                acts = "";
            }
        }

        var table = { rows: rows };
        totalNumPages = Math.floor((table.rows.length - 1) / rowsPerPage) + 1;
        if(currentPage > totalNumPages && totalNumPages > 0)
            currentPage = totalNumPages;

        var start = (currentPage - 1)*rowsPerPage;
        table.rows = table.rows.splice(start, rowsPerPage);

        table.totalNumPages = totalNumPages;
        table.currentPage = currentPage;
        table.rowsPerPage = rowsPerPage;

        var page = [];
        var pageStart = Math.max(1, table.currentPage-2);
        var pageEnd = Math.min(parseInt(table.totalNumPages), parseInt(table.currentPage)+2);

        for(var i=pageStart; i<=pageEnd; i++) {
            if(table.currentPage == i) {
                if(i < 10)
                    page.push({ name: i, className: "active" });
                else
                    page.push({ name: i, className: "modactive" });
            }
            else {
                if(i < 10)
                    page.push({ name: i, className: "" });
                else
                    page.push({ name: i, className: "mod" });
            }
        }
        var prevPage = (table.currentPage == 1) ? null : table.currentPage - 1;
        var nextPage = (table.currentPage == table.totalNumPages) ? null : parseInt(table.currentPage) + 1;

        core.content.pieces.tableBody({table:table, th:th, fields: colnames});
        core.content.pieces.tableFooter({page: page, prevPage: prevPage, nextPage: nextPage, totalNumPages: totalNumPages, colspan: th.length});
    };

    this.find = function(baseQuery, baseSort) {
	assert(isObject(this.specs.ns));
	return this.specs.ns.find(this._query(baseQuery||{}), this._fieldsFilter()).sort(this._sort(baseSort));
    };

    this.dbview = function(cursor) {
        if(request.style || this.specs.style)
            print('<link type="text/css" rel="stylesheet" href="'+(request.style || this.specs.style)+'" />');
        else
            print('<link type="text/css" rel="stylesheet" href="/~~/content/assets/table.css" />');

        var idStr = (this.specs.id && this.specs.id !=null && this.specs.id != "null") ? "id='"+this.specs.id+"'" : "";
        this._rows(cursor );
        core.content.pieces.tablejs();
    };

    this.arrview = function( arr ){
        print("<table>\n");
        this._rows( arr.iterator() );
        print("</table>\n");
    };

};
