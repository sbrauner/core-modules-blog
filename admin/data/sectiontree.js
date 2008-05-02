var applications = {};

if ( allowModule ){
    for ( var mod in allowModule ){
        applications[mod] = { $: "/admin/" + mod + "/index" };
    }
}


return {
    'system': {
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
