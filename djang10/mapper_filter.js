

function MapperFilter() {
}


MapperFilter.matchURI = function(uri)  {
    
    var map = djang10.getControllerMap();
    var keys = map.keys();
    var match_array = null;
    var duple = null;

    for (i in keys) {
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