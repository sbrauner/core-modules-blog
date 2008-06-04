// csv.js

content.CSVContent = function( rawContent ){
    var t = new content.CSVContent.Tokenizer( rawContent );

    this.headers = t.nextLine();
    this.headerMap = {};
    for ( var i=0; i<this.headers.length; i++ )
        this.headerMap[this.headers[i]] = i;
    
    this.lines = [];

    var l = null;
    while ( ( l = t.nextLine() ) != null )
        this.lines.add( l );
};

content.CSVContent.Tokenizer = function( raw ){
    this.raw = raw;
    this.pos = 0;
};
    

content.CSVContent.Tokenizer.prototype.nextLine = function(){

    if ( this.pos >= this.raw.length ) 
        return null;

    var pieces = [];
    var p;
    while ( ( p = this.nextPiece() ) != null ){
        pieces.add( p );
    }
    return pieces;
}

content.CSVContent.Tokenizer.prototype.peek = function(){
    return this.raw[ this.pos ];
}

content.CSVContent.Tokenizer.prototype.next = function(){
    return this.raw[ this.pos++ ];
}

content.CSVContent.Tokenizer.prototype.skipWhiteSpace = function(){
    while ( this.raw[this.pos] == " " )
        this.pos++;
}

content.CSVContent.Tokenizer.prototype.nextPiece = function(){

    this.skipWhiteSpace();

    if ( this.pos >= this.raw.length ) 
        return null;

    if ( this.peek() == "\n" || this.peek() == "\r" ){
        this.pos++;
        if ( this.peek() == "\n" )
            this.pos++;
        return null;
    }

    var cur = "";
    
    while ( true ){
        var c = this.next();

        if ( c == "," )
            break;
        
        if ( c == "\r" || c == "\n" ){
            this.pos--;
            break;
        }
        
        if ( c != '\"' ){
            cur += c;
            continue;
        }
        
        while ( true ){
            c = this.next();
            if ( c == '"' )
                break;
            cur += c;
        }
        
    }

    return cur;
};


/**
* if field is a number it returns number field (0 based).  if its a string, it looks for that header
*/
content.CSVContent.prototype.getField = function( lineNumber , field ){
    if ( isString( field ) ){
        var id = this.headerMap[ field ];
        if ( id == null )
            throw "can't find field [" + field + "]";
        field = id;
    }
        
    return this.lines[lineNumber][field];
};

content.CSVContent.prototype.numLines = function(){
    return this.lines.length;
}

content.CSVContent.prototype.forEach = function( func ){
    this.lines.forEach( func );
}
