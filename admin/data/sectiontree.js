var tree = {
    'statistics' : {
        'usage': 'Usage',
    },
    'users': {},
    'database': {
        'dbview': 'View Collections',
        'dbprofile': 'Profiling',
        'dbshell': 'Database Shell',
    },
    'files': {
    },
    'cron': {
    },
    'logs': {
        'logMemory': 'Logs in Memory',
        'logScroll': 'Scrolling Logs'
    },
    'shell': {
    },
    'editor': {
        $: '/admin/ed'
    },
    'git': {
        $: '/admin/gitLocal',
    },
    'docs': {},
};

if ( allowModule ){
    tree['applications'] = false;

    for ( var mod in allowModule ){
        tree[mod] = { $: "/admin/" + mod + "/index" };
        var appNav = admin.getAppNav(mod);
        for ( var i in appNav ){
            if(appNav[i].target != false)
                tree[mod][mod+'/'+appNav[i].target] = appNav[i].pretty;
        }
    }
}

return tree;