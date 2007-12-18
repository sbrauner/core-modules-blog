// text.js

Text = {

    snippet: function(s) { 
	if( !isString(s) )
	    return s;
	s = s.substring(0,4000);
	s = s.replace(/<[^>]*>/g, "");
	var i = 23;
	if( s.length > i+2 ) {
	    while( s.charAt(i) != '.' && s.charAt(i) != ' ' && i < s.length ){ 
		i++;
            }
	    s = s.substring(0,i);
	}
	return s;
    }

}
