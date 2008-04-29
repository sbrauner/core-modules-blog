var applications = {};

if ( allowModule ){
    for ( var mod in allowModule ){
        applications[mod] = { $: "/admin/" + mod + "/index" };
    }
}


return {
    'system': {
        'users': {},
        'database': {
            'dbview': true,
            'dbprofile': true,
        },
        'files': {
        },
        'cron': {
        },
        'logs': {
            'logMemory': true,
            'logScroll': true
        },
    },
    'editor': {
        $: '/admin/ed'
    },
    'git': {
        $: '/admin/gitLocal',
        'git': {}
    },
    'docs': {
        'docs': {}
    },
    'applications': applications

};
