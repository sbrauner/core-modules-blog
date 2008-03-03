
LocalEdit = {};

LocalEdit.needsSaving = false;
LocalEdit.curFile = null;
LocalEdit.editing = false;
LocalEdit.lastValue = null;

LocalEdit.fixNotify = function(){
    if ( ! LocalEdit.curFile ){
        $( "notify" ).innerHTML = " Select a file from left";
        return;
    }
    
    var html = "<b>" + LocalEdit.curFile + "</b> ";
    html += " e: edit ";
    if ( LocalEdit.needsSaving )
        html += "<span style='color:red;'><b> s: save </b></span>";
    
    $( "notify" ).innerHTML = html;
    
    
}

LocalEdit.edit = function(){
    LocalEdit.editing = true;
    editor( document.getElementById( "content" ) , LocalEdit.doneEditing );
}

LocalEdit.save = function(){
    if ( ! LocalEdit.needsSaving )
        return;
    
    if ( ! LocalEdit.curFile )
        return;
    
    var postData = "action=save&file=" + escape( LocalEdit.curFile );
    postData += "&content=" + escape( $( "content" ).value );
    
    var res = loadDocSync( "/~~/admin/_localEditControl" , postData );

    if ( res.match( /OK/ ) ){
        window.alert( "Saved" );
        LocalEdit.needsSaving = false;
        LocalEdit.fixNotify();
        return;
    }
    
    window.alert( "couldn't save : " + res );
}

LocalEdit.emptyLine = function( s ){
    return s.match( /^ *$/ );
}

LocalEdit.areTheSame = function( aStr , bStr ){
    var a = aStr.split( "\n" );
    var b = bStr.split( "\n" );
    
    var i = 0;
    var min = Math.min( a.length , b.length );

    for ( ; i < min; i++ ){
        if ( a[i] != b[i] ){
            return false;
        }
    }
    
    for ( var j=i; j<a.length; j++ )
        if ( ! LocalEdit.emptyLine( a[j] ) )
            return false;

    for ( var j=i; j<b.length; j++ )
        if ( ! LocalEdit.emptyLine( b[j] ) )
            return false;

    return true;
}

LocalEdit.doneEditing = function(){

    LocalEdit.editing = false;
    
    var now = $( "content" ).value;

    if ( ! LocalEdit.areTheSame( now , LocalEdit.lastValue  ) ){
        
        LocalEdit.lastValue = now;
        var html = LocalEdit.fixForHtml( now );
        $( "preview" ).innerHTML = html;
        LocalEdit.needsSaving = true;
    }
    
    LocalEdit.fixNotify();
}

LocalEdit.openFile = function( f ){
    LocalEdit.curFile = f;
    var url = "/~~/admin/_localEditControl?action=load&file=" + escape( f );
    loadDocAsync( url , LocalEdit.openFileHandler );
}

LocalEdit.fixForHtml = function( source ){
    var fixed = source.trim();
    fixed = fixed.replace( /</g , "&lt;" );
    fixed = fixed.replace( />/g , "&gt;" );
    fixed = fixed.replace( /\r?\n/g , "<br>" );
    fixed = fixed.replace( / /g , "&nbsp;" );
    return fixed;
}

LocalEdit.openFileHandler = function( txt ){
    $( "content" ).value = txt;
    LocalEdit.lastValue = txt;

    $( "preview" ).innerHTML = LocalEdit.fixForHtml( txt );

    LocalEdit.fixNotify();
}

LocalEdit.openDirectory = function( dir ){
    dir = dir || "/";
    var url = "/~~/admin/_localEditControl?action=ls&root=" + escape( dir );
    loadDocAsync( url , LocalEdit.openDirectoryHandler );
};

LocalEdit.openDirectoryHandler = function( txt ){

    var res = null;
    eval( "res = " + txt );
    var root = res.root;
    var all = res.ls;

    var html = "";
    var sofar = "";
    root.replace( /\/(\w+)/g , function( a , b ){
        sofar += "/";
        html += "<a href=\"javascript:LocalEdit.openDirectory('" + sofar + "')\">" + "/" + "</a>";
        sofar += b;
        html += "<a href=\"javascript:LocalEdit.openDirectory('" + sofar + "')\">" + b + "</a>";
    } );
    
    if ( html.length == 0 )
        html += "/";

    html += "<hr>"

    for ( var i=0; i<all.length; i++ ){

        var f = all[i];
        var name = f.name;
        
        var link = null;
        if ( f.isDirectory ){
            name += "/";
            link = "javascript:LocalEdit.openDirectory( '" + root + "/" + name + "' )";
        }
        else {
            link = "javascript:LocalEdit.openFile( '" + root + "/" + name + "' )";
        }
        
        html += "<a href=\"" + link + "\">" + name + "</a><br>";
    }

    $( "files" ).innerHTML = html;
};

var clientLoader = new YAHOO.util.YUILoader();

clientLoader.insert({
    require: ['event','dom'],
    base: '/@@/yui/current/',

    onSuccess: function(loader) {
            YAHOO.util.Event.onDOMReady( function() {

		( new YAHOO.util.KeyListener(document, { keys: 69 } , function(){
                    if ( LocalEdit.editing )
                        return;
                    LocalEdit.edit();
                } ) ).enable();
                
		( new YAHOO.util.KeyListener(document, { keys: 83 } , function(){
                    if ( LocalEdit.editing )
                        return;
                    LocalEdit.save();
                } ) ).enable();

            });
        }
});    

