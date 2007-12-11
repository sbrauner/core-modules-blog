
Captcha = { 
    img : function(){

        if ( ! response )
            throw( "need a response" );

        if ( ! db )
            throw( "need a db" );

        var s = "eliot";
        JSCaptcha.img( s , response );
        
        var id = "asd" + Math.random();
        
        db.user.captcha.save( { id : id , s : s , ts : Date() } );
        response.addCookie( "cid" , id );
    } ,
    
    valid : function(){
        SYSOUT( "in valid" );
        if ( ! request )
            return false;
        
        var id = request.getCookie( "cid" );
        SYSOUT( "id:" + id );
        if ( ! id )
            return false;
        
        var c = db.user.captcha.findOne( { id : id } );
        SYSOUT( "c:" + c );
        if ( ! c ){
            return false;
        }

        // check time
        db.user.captcha.remove( c );
        
        return request.captcha == c.s;
    }
    
};
