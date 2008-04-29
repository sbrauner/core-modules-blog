admin.data.Bash = function(){

};

Object.extend(admin.data.Bash.prototype, {
    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('-')) continue;
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);
        }

    },
    ls: function(files){
        files = files || [];
        this._validate(files);
        var foo = sysexec("ls " + files.join(' '));

        return foo;
    },
    rm: function(files){
        files = files || [];
        this._validate(files);
        var foo = sysexec('rm ' + files.join(' '));

        return foo;
    },
    mv: function(files){

    },
    cp: function(files){

    },
    git: function(files){

    },
    diff: function(files){

    },
    cat: function(files){

    },
    head: function(files){

    },
    tail: function(files){

    },
    date: function(){

    },
    grep: function(files){

    },
});