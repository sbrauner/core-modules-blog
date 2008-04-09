
core.util.words();

Captcha = {

    DEBUG : false ,

    words : { 
	english : function( minLen , maxLen ){
	    return Captcha.words._word( Util.Words.usa , minLen , maxLen );
	},

	_word : function( words , minLen , maxLen ){
	    
	    assert( words );
	    
	    var min = minLen || 3
	    var max = maxLen || 5;

	    assert( max >= min );

	    while ( true ){
		var s = words.getRandomWord();
		s = s.replace( /[^\w]+/g , "" );
		s = s.toLowerCase();

		if ( s.length >= min && s.length <= max )
		    return s;
	    }

	} ,
	
	gobblygook : function( minLen ){
	    var min = minLen || 6;

            var s = "";
            while ( s.length < min )
		s += md5( Math.random() ).replace( /\d/g , "" ).substring( 0 , 6 );	
	    
	    return s;
	}
	
    } , 

    img : function(){
        if ( ! response )
            throw( "need a response" );
	
	var s = Captcha.words.english();

        JSCaptcha.img( s , response );
        return Captcha.USE.img( s );
    } ,

    valid : function( request ){
        if ( ! request )
            return false;

        var id = request.getCookie( "cid" );
        if ( Captcha.DEBUG ) SYSOUT( " captcha id : " + id );
        if ( ! id )
            return false;

        var res = request.captcha;
        if ( Captcha.DEBUG ) SYSOUT( " captcha res : " + res );
        if ( ! res )
            return false;

        return Captcha.USE.valid( id , res );
    } ,

    hash : {
        img : function ( s ){
            response.addCookie( "cid" , md5( s ) );
        } ,

        valid : function( id , res ){
            return id == md5( res );
        }
    } ,

    db : {

        img : function( s ){

            if ( ! db )
                throw( "need a db" );

            if ( Math.random() > .99 ){
                var d = new Date();
                d = new Date( d.getTime() - ( 1000 * 3600 * 6 ) );
                if ( Captcha.DEBUG ) SYSOUT( "deleting before : " + d );
                db.user._captcha.remove( { ts : { $lt : d } } );
            }

            var obj = { s : s , ts : new Date() };
            db.user._captcha.save( obj );
            if ( Captcha.DEBUG ) SYSOUT( tojson( obj ) );
            response.addCookie( "cid" , obj._id );
        } ,

        valid : function( id , res ){

            id = ObjectId( id );

            var c = db.user._captcha.findOne( id );
            if ( Captcha.DEBUG ) SYSOUT( "c:" + tojson( c ) );

            if ( ! c )
                return false;

            return res == c.s;
        }
    }

};

Captcha.USE = Captcha.hash;
