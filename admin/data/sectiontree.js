var tree = {
    'statistics' : {
        'usage': 'Usage',
    },
    'users': '/admin/users',
    'database': {
        'dbview': 'View Collections',
        'dbprofile': 'Profiling',
        'dbshell': 'Database Shell',
    },
    'files': '/admin/files',
    'cron': '/admin/cron',
    'logs': {
        'logMemory': 'Logs in Memory',
        'logScroll': 'Scrolling Logs'
    },
    'shell': '/admin/shell',
    'editor': '/admin/ed',
    'git': '/admin/gitLocal',
    
 // remove for now until we get this sorted
 
 /*   'docs': '/admin/docs', */
};

if ( allowModule ){
    tree['Applications'] = false;

    for ( var mod in allowModule ){
        var appNav = admin.getAppNav(mod);
        if(appNav.length == 0){
            tree[mod] = "/admin/" + mod + "/index";
            continue;
        }
        tree[mod] = { $: "/admin/" + mod + "/index" };
        for ( var i in appNav ){
            if(appNav[i].target != false)
                tree[mod][mod+'/'+appNav[i].target] = appNav[i].pretty;
        }
    }
}

return tree;