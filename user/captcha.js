
Captcha = { 
    
    DEBUG : false ,
    
    img : function(){

        if ( ! response )
            throw( "need a response" );

        if ( ! db )
            throw( "need a db" );

	if ( Math.random() > .99 ){
	    var d = new Date();
	    d = new Date( d.getTime() - ( 1000 * 3600 * 6 ) );
	    if ( Captcha.DEBUG ) SYSOUT( "deleting before : " + d );
	    db.user._captcha.remove( { ts : { $lt : d } } );
	}
			  
	
	var s = "";
	while ( s.length < 6 )
	    s += md5( Math.random() ).replace( /\d/g , "" ).substring( 0 , 6 );
        JSCaptcha.img( s , response );
        
	var obj = { s : s , ts : Date() };
        db.user._captcha.save( obj );
	if ( Captcha.DEBUG ) SYSOUT( tojson( obj ) );
        response.addCookie( "cid" , obj._id );
    } ,
    
    valid : function( request ){
        if ( Captcha.DEBUG ) SYSOUT( "in valid" );

        if ( ! request )
            return false;
        
        var id = request.getCookie( "cid" );

        if ( ! id )
            return false;
        
	id = ObjectId( id );
	if ( Captcha.DEBUG ) SYSOUT( "id : " + id + " : " + db.user._captcha );
        var c = db.user._captcha.findOne( id );
        if ( Captcha.DEBUG ) SYSOUT( "c:" + tojson( c ) );
        if ( ! c ){
            return false;
        }

        // TODO: check time
        //db.user._captcha.remove( c );
        
	if ( Captcha.DEBUG ) SYSOUT( "request.captcha : " + request.captcha );
        return request.captcha == c.s;
    }
    
};
