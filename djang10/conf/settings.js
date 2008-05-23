settings = (function() {
    scope.setGlobal(true);
    
    if(local.settings != null) {
        local.settings();
    }
    return settings;
})();

return settings;