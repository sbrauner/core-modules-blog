/* 
   e.g.:

   xml.to( print, "myobjtype", { name: "foo", x : 3 } );

   <myobjtype>
     <name>foo</name>
     <x>3</x>
   </myobjtype>

*/

xml = {

    toString : function( name , obj ){
        var s = "";
        xml.to( function( z ){ s += z; } , name , obj );
        return s;
    } ,
    
    to : function( append , name , obj , indent ){

        if ( ! indent ) indent = 0;
        
        if ( ! name )
            name = obj._name;

        var newLine = false;
        
        if ( name ){
            xml._indent( append , indent );        
            append( "<" + name  );
            if ( isObject( obj ) && isObject( obj._props ) ){
                for ( var a in obj._props ){
                    append( " " + a + "=\"" + obj._props[a] + "\" " );
                }
            }

            if ( obj == null ){
                append( " />" );
                return;
            }

            append( ">" );
        }
        
        if ( obj == null ){
        }
        else if ( isString( obj ) || isDate( obj ) ){
            append( obj );
        }
        else if ( isObject( obj ) ){
            
            newLine = true;
            append( "\n" );
            for ( var prop in obj ){
                if ( prop == "_props" || prop == "_name" )
                    continue;
                
                var child = obj[prop];

                if ( isArray( obj ) && isObject( child ) && child._name && prop.match( /\d+/ ) )
                    xml.to( append , null , child , indent + 1 );
                else
                    xml.to( append , prop , child , indent + 1 );
            }
        }
        else {
            append( obj );
        }
        
        if ( name ){
            if ( newLine )
                xml._indent( append , indent );
            append( "</" + name + ">\n" );
        }

    } ,
    
    _indent : function( append , indent ){
        for ( var i=0; i<indent; i++ )
            append( " " );
    } ,

    fromString : function( s ){
	return from(xml._xmlTokenizer(s));
    },

    _xmlTokenizer : function( s ){
	var pos = 0;
	var insideTag = false;
	var attrName = false;
	var attrValue = false;
	var tagName = false;
	return function(){
	    var re = /[\w<>?=\/'"]/;
	    var exec = re.exec(s);
	    if (exec == null) return -1;
	    var start = exec.index;
	    var sub = s.substring(start, s.length);
	    if(insideTag == false){
		if(s.substring(start, 1) == "<"){
		    insideTag = true;
		    var s2 = /[\w]/.exec(sub).index;
		    if(sub.substring(s2, s2+1) == "?"){
			s = sub.substring(s2+1, sub.length);
			return "<?";
		    }
		    s = s.substring(start+1, s.length);
		    return "<";
		}
		if(s.substring(start, 1) == "?"){
		    var s2 = /[\w]/.exec(sub).index;
		    if(sub.substring(s2, 1) == ">"){
			s = sub.substring(s2+1, sub.length);
			insideTag = false;
			return "?>";
		    }
		}
		var next = sub.indexOf("<");
		s = sub.substring(next, sub.length);
		return sub.substring(0, next);
	    }
	    else {
		if(s.substring(start, 1) == "/"){
		    s = s.substring(start+1, s.length);
		    return "/";
		}
		if(s.substring(start, 1) == ">"){
		    tagName = insideTag = false;
		    s = s.substring(start+1, s.length);
		    return ">";
		}
		if(!tagName){
		    var s2 = /[^\w]/.exec(sub).index;
		    s = s.substring(start+s2, s.length);
		    tagName = true;
		    return sub.substring(0, s2);
		}
		if(!attrName){
		    var s2 = /[^\w]/.exec(sub).index;
		    s = sub.substring(s2, sub.length);
		    attrName = true;
		    return sub.substring(0, s2);
		}
		if(attrValue){
		    var q = sub.substring(0, 1);
		    var r = q+"(.+)"+q+"(.*)";
		    var results = new RegExp(r).exec(sub);
		    s = results[2];
		    attrName = attrValue = false;
		    return results[1];
		}
		else if(!attrValue) {
		    var s2 = /=/.exec(sub).index;
		    s = sub.substring(s2+1, sub.length);
		    attrValue = true;
		    return "=";
		}
		
	    }
	};
    },

    from : function( tokenizer ){
	var i = 0;

	var next = tokenizer();
	if(next == "<?"){
	    // XML declaration
	    // FIXME: do something
	    while (next != "?>") next = tokenizer();
	}

	var result = _from(tokenizer);
	return result.root;
    } ,

    _from : function( tokenizer ){
	var root = {};
	var next;

	while(true){
	    next = tokenizer();
	    if (next == -1) break;
	    if (s.substring(next+1, next+2) == "/") break;
	    var right = s.indexOf(">");
	    var name = s.substring(next+1, right-1);
	    var result = _from(s.substring(right+1, s.length));
	    root[name] = result.root;
	    s = result.remaining;
	    next = s.indexOf("</"+name+">");
	    s = s.substring(next, s.length);
	}
	
	return {root: root, remaining: s};
	
    }
    
};

s = "<thingy attr='name'>hi</thingy>";
f = xml._xmlTokenizer(s);
while(true){
    tok = f();
    if (tok == -1) break;
    print(tok);
}
