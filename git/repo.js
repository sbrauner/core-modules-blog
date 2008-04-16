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
        var ret = this._exec( "git push" );

        return ret;
    },
    pull: function(){
        var ret = this._exec( "git pull" );

        return ret;
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
        var ret = this._exec("git status");

        ret.parsed = this._parseStatus(ret.out);

        return ret;
    },
    _parseStatus: function(output){
        var info = {};
        var stat = output.trim();
        var statlines = stat.split(/\n/g);
        var currentState = ""; // "untracked", "changed", "staged", ??

        var filename = "";
        var filetype = "";
        for(var i = 0; i < statlines.length; ++i){
            // Special cases for special lines:
            if(statlines[i].match(/# On branch (.+)$/))
                continue;

            if(statlines[i].match(/# Initial commit/))
                continue;

            if(statlines[i].match(/#\s*$/)) continue;

            if(statlines[i].match(/use \"git /)){
                // We don't need usage advice, thanks
                continue;
            }

            if(statlines[i].match(/^\w/)){
                // like "nothing to commit" or "nothing added to commit"
                // we should probably handle this!

                continue;
            }
            // END special cases


            if(statlines[i].match(/# Changed but not updated:/)){
                currentState = "changed";
                continue;
            }

            if(statlines[i].match(/# Untracked files:/)){
                currentState = "untracked";
                continue;
            }

            if(statlines[i].match(/# Changes to be committed:/)){
                currentState = "staged";
                continue;
            }

            var exec = statlines[i].match(/#\s+(modified|new file):\s+(.+)$/);
            if(exec){
                filetype = exec[1];
                filename = exec[2];
                file = {name: filename, type: filetype};
            }
            else {
                var exec = statlines[i].match(/#\s+(.+)$/);
                file = exec[1];
            }

            if(! (currentState in info) ) info[currentState] = [];
            info[currentState].push(file);
        }

        return info;
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

