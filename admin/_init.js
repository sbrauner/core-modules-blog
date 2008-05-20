admin = {};

log.admin.level = log.LEVEL.ERROR;

admin.getAppNav = function(key){
    var appNav;
    if(core[key] && core[key].admin && core[key].admin.leftNav) appNav = core[key].admin.leftNav;
    else if(core.app[key] && core.app[key].admin && core.app[key].admin.leftNav) appNav = core.app[key].admin.leftNav;
    else appNav = function(){ log.admin.debug("Can't get nav tree for application " + key); return{tree: [], reverse: []}; };
    appNav = appNav();
    return appNav;
};

