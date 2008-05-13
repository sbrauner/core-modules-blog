var tree = {
    'statistics' : {
        'usage': true,
    },
    'users': {},
    'database': {
        'dbview': true,
        'dbprofile': true,
        'dbshell': true,
    },
    'files': {
    },
    'cron': {
    },
    'logs': {
        'logMemory': true,
        'logScroll': true
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
    }
}

return tree;