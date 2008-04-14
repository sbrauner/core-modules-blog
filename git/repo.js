git.Repo = function(){

};

Object.extend(git.Repo.prototype, {
    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);
        }
    },
    _init: function(){
        print(scope.getRoot());
        return sysexec("git init");
    },
    push: function(){
    },
    pull: function(){
    },
    add: function(files){
        this._validate(files);

        var cmd = "git add ";
        files.forEach( function( z ){ cmd += " " + z; } );
        return sysexec( cmd );
    },
    diff: function(files){
        var cmd = "git diff ";
        request.getParameters( "file" ).forEach( function( z ){ cmd += " " + z; } );
        return sysexec( cmd );
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
        return foo;
    },
    status: function(){
        return sysexec("git status");
    }
});

