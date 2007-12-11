// htmlhelper.js

/* Usage
  
  These are the same:
   div( {cls: "foo", id: "bar"} ); print("hello"); _div();
   div( {cls: "foo", id: "bar"}, "hello" );

   div( { hidden : true } );           // style visibility hidden

   form();
   input( { name: "fieldname", size : 40, value: "initial" } );
   textarea( { name: "fieldname", cols : 40, rows : 20 } );
   _form();

   ul("string");
   ul(function);

   li(...);
   

 */

function __echoAttribute(x,v) { 
    if( v )
	print(v + '="'+x[v]+'" ');
}

function A(url, text) {
    return '<a href="'+url+'">'+text+'</a>';
}

function a(url,text) { print( A(url,text) ); }

// todo: take extra arguments here and call __finishTag
function __doTag(name,x) { 
    print('<'); print(name); print('>');
    if( typeof(x) == 'function' ) { 
	var val = x(); // todo: fix use =='function'
        if( val!=null ) print(val);
    }
    else print(x);
    print('</'); print(name); print('>');
}

function ul(x) { 
    __doTag("ul",x);
}

function li(x) { 
    __doTag("li", x);
}

function textarea(x) { 
    print('<textarea rows="'+x.rows+' cols="'+x.cols+'>');
    __echoAttribute(x,"name");
    var value = request[x.name] || x.value;
    if( value ) print(value);
    print('</textarea>\n');
}

function input(x) {
    print('<input ');
    __echoAttribute(x,"size");
    var value = request[x.name] || x.value;
}

function __finishTag(endtag, args) {
    var x = args[0];
    if( x.cls ) print(' class="'+x.cls+'"');
    __echoAttribute(x,"id"); 
    if( x.hidden ) print(' style="visibility: hidden;"');
    print('>');
    if( args[1] ) { print(args[1]); endtag(); }
}

function _div() { print("</div>\n"); }
function div(x) {
    print("<div"); __finishTag(_div, arguments);
}

function tr(x) { __doTag("tr",x); }
function td(x) { __doTag("td",x); }
function th(x) { __doTag("th",x); }
