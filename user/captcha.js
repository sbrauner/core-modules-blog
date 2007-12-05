
Captcha = { 
    img : function(){

        if ( ! response )
            throw( "need a response" );

        if ( ! db )
            throw( "need a db" );

        var s = "eliot";
        JSCaptcha.img( s , response );
        
        var id = "asd" + Math.random();
        
        db._captcha.save( { id : id , s : s , ts : Date() } );
        response.addCookie( "cid" , id );
    } ,
    
    valid : function(){
        if ( ! request )
            return false;
        
        var id = request.getCookie( "cid" );
        if ( ! id )
            return false;
        
        var c = db._captcha.findOne( { id : id } );
        if ( ! c )
            return false;

        // check time
        db._captcha.remove( c );
        
        return request.captcha == c.s;
    }
    
};
