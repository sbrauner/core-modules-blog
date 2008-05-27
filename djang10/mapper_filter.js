

function MapperFilter() {
}


MapperFilter.matchURI = function(uri)  {
    
    var map = djang10.getControllerMap();
    var keys = map.keys();
    var match_array = null;
    var duple = null;

    for(var i=keys.length - 1; i>=0 ; i--) {
        match_array = uri.match(keys[i]);

        if (match_array != null) {
            duple = map.get(keys[i]);
            break;
        }
    }
    
    if (duple == null) {
        return null;
    }
    else {
        return { duple : duple, match_array : match_array };
    }
}