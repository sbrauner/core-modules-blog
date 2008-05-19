core.core.routes();

//hijack all the url mappings to route to the mapper
var map = djang10.getControllerMap();

if(!routes) {
    routes = new Routes();
}


map.keys().forEach(function(urlPattern) {
    log.djang10("urlPattern: " + urlPattern);    
    routes.add(urlPattern, "~~/djang10/mapper.jxp");
});
