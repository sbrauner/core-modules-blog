admin.data.Bash = function(){

};

Object.extend(admin.data.Bash.prototype, {

    handle: function(cmd, files){
        var commands = ['ls', 'rm', 'mv', 'cp', 'git', 'diff', 'cat', 'head', 'tail', 'date', 'grep'];
        assert(commands.contains(cmd));
        files = files || [];
        this._validate(files);
        var foo = sysexec(cmd + " " + files.join(' '));

        return foo;
    },

    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('-')) continue;
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);
        }

    },
    ls: function(files){
        return this.handle('ls', files);
    },
    rm: function(files){
        return this.handle('rm', files);
    },
    mv: function(files){
        return this.handle('mv', files);
    },
    cp: function(files){
        return this.handle('cp', files);
    },
    git: function(files){
        var cmd = files ? files[0] : "";
        files = files.slice(1) || [];
        this._validate(files);
        var foo = sysexec('git ' + cmd + files.join(' '));

        return foo;
    },
    diff: function(files){
        return this.handle('diff', files);
    },
    cat: function(files){
        return this.handle('cat', files);
    },
    head: function(files){
        return this.handle('head', files);
    },
    tail: function(files){
        return this.handle('tail', files);
    },
    date: function(){
        return this.handle('date', files);
    },
    grep: function(files){
        return this.handle('grep', files);
    },
});
