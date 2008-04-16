git.Repo = function(){

};

Object.extend(git.Repo.prototype, {
    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);
        }
    },
    _exec: function(cmd){
        var foo = sysexec( cmd );
        foo.cmd = cmd;
        return foo;
    },
    _init: function(){
        print(scope.getRoot());
        return this._exec("git init");
    },
    _clone: function(from, as){
        var cmd = "git clone " + from;
        if(as) cmd += " " + as;
        return this._exec( cmd );
    },
    push: function(){
        return this._exec( "git push" );
    },
    pull: function(){
        return this._exec( "git pull" );
    },
    add: function(files){
        this._validate(files);

        var cmd = "git add ";
        files.forEach( function( z ){ cmd += " " + z; } );
        return this._exec( cmd );
    },
    diff: function(files){
        this._validate(files);
        var cmd = "git diff ";
        files.forEach( function( z ){ cmd += " " + z; } );
        return this._exec( cmd );
    },
    commit: function(files, msg, user){
        if(!msg) throw "git commit needs a message";
        this._validate(files);
        var cmd = "git commit -F - ";

        cmd += " --author \"" + user.name + " <" + user.email + ">\" ";
        var env = {};

        env.GIT_AUTHOR_NAME = user.name;
        env.GIT_COMMITTER_NAME = user.name;
        env.GIT_AUTHOR_EMAIL = user.email;
        env.GIT_COMMITTER_EMAIL = user.email;

        files.forEach( function( z ){ cmd += " " + z; } );
        log.git.repo.debug("committing; git command: " + cmd);
        var foo = sysexec( cmd , msg , env );
        foo.cmd = cmd;
        return foo;
    },
    status: function(){
        return this._exec("git status");
    },
    checkout: function(files, opts){
        this._validate(files);
        var cmd = "git checkout ";
        if(opts.force) cmd += "-f ";
        if(opts.rev) cmd += opts.rev + " ";
        cmd += files.join(" ");
        return this._exec( cmd );
    },
});

