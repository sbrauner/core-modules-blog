
log.app.info("Running app._init");

if ( app ){ // attempt to find weird bug
    log.app.info( "re-running app._init.  might be ok, might not" );
    try {
        throw Exception( "temp2" );
    }
    catch ( e ){
        e.printStackTrace();
    }
}

app = Object();
