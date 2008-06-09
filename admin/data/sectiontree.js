// How the menu looks, and where the links go
// This currently assumes order is preserved in JS objects; bad, naughty
// Structure is: key: 'target' or
// key: { 'target': 'PrettyName', 'target': 'Pretty Name'}
// If tree[key] is a string, the link is a real link that takes you to target
// If tree[key] is an object, then it's a submenu that expands to links
// <a href="/admin/target">PrettyName</a>
// If tree[key].$, then the link instead goes to
// <a href="/admin/<%= tree[key].$ %>/target instead
core.ext.getlist();
var tree = {
    'statistics' : {
        'usage': 'Usage',
    },
    'users': '/admin/users',
    'database': {
        'dbview': 'View Collections', // These should probably be backwards
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

 // remove for now until we get this improved
/*    'editor': '/admin/ed', */
    'git': '/admin/gitLocal',

 // remove for now until we get this sorted

 /*   'docs': '/admin/docs', */
};

// Maps jxp names to sections
var reverse = {
    'statistics' : ['statistics', 'usage'],
    'usage' : ['statistics', 'usage'],

    'users': ['users'],
    'user': ['users'],

    'database': ['database', 'dbview'],
    'dbview': ['database', 'dbview'],
    'dbprofile': ['database', 'dbprofile'],
    'dbshell' : ['database', 'dbshell'],

    'files': ['files'],

    'cron': ['cron'],
    'editCron': ['cron'],

    'logs': ['logs', 'logScroll'],
    'logScroll': ['logs', 'logScroll'],
    'logMemory': ['logs', 'logMemory'],

    'shell': ['shell'],

// remove for now until we get this improved
/*    'editor': ['editor', 'editor'], */
    'gitLocal': ['git', 'git'],

//  remove for now until we get this sorted

        /* 'doc': ['docs'], */
    'applications': ['applications'],
};


// For each appModule we added, get its forward map, and merge it
// Expected structure is: list of {pretty: 'Str', target: 'pagename' || false}
// false means it's the toplevel element and don't expand it
// If there's no map at all, just include a link to go to /admin/modname/index
if ( allowModule ){
    tree['Applications'] = false;

    for ( var mod in allowModule ){
        var appNav = admin.getAppNav(mod);
        var appTree = appNav.tree;
        if(appTree.length == 0){
            tree[mod] = "/admin/" + mod + "/index";
            continue;
        }
        // this entry indicates the parent for these links
        tree[mod] = { $: mod };
        for ( var i in appTree ){
            if(appTree[i].target != false)
                tree[mod][appTree[i].target] = appTree[i].pretty;
        }
    }
}

// Build an appropriate reverse map
// First, we build a reverse map from the forward map: a page modname/target
// is [modname, target]. That's because tree[modname][target] is the section
// such a link is in.
// There can also be bonus reverse information in appReverse, which
// is merged into the reverse map. appReverse is expected to be:
// 'orig_page': 'acts_like_page'
// meaning: map orig_page to the same list as acts_like_page.
for(var key in allowModule){
    var appNav = admin.getAppNav(key);
    var appTree = appNav.tree;
    var appReverse = appNav.reverse;

    for(var i in appTree){
        var pair = appTree[i];
        var name = key;
        if(pair.target != false)
            name += '/'+pair.target;
        reverse[name] = [key, pair.target];
    }

    for(var page in appReverse){
        var actslike = appReverse[page];
        reverse[key+'/'+page] = reverse[key+'/'+actslike];
    }

}

// Remove sections that user can't access
if(Ext.getlist(allowModule, 'admin', 'permissions') && ! user.isAdmin()){
    var adminperm = Ext.getlist(allowModule, 'admin', 'permissions');
    for(var key in Object.extend({}, tree)){
        var obj = tree[key];
        if(typeof obj == "string"){
            if(! adminperm.allowed(user, null, obj)){
                delete tree[key];
            }
        }
        else if(typeof obj == "boolean"){
            // pass: too much work
            // tree[key] == false, the magical third level of menu
            // We'd have to know if every key after this failed or something
        }
        else{
            // typeof obj == "object"; we have a second menu of levels
            // we can prune the whole subtree if it doesn't contain a single
            // allowed thing
            var subtree = obj;
            var pass = false;
            for(var subkey in Object.extend({}, subtree)){
                var url = key+"/"+subkey;
                if(!adminperm.allowed(user, null, url)){
                    delete subtree[subkey];
                }
                else {
                    pass = true;
                }
            }
            if(! pass)
                delete tree[key];
        }
    }
}

return {tree: tree, reverse: reverse};
