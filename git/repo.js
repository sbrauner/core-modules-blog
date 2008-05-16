core.core.file();

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
        cmd = "git " + cmd;
        var foo = sysexec( cmd );
        foo.cmd = cmd;

        return foo;
    },
    _gitEnv: function(user){
        // We pass this environment on commit and pull commands.
        var env = {};

        env.GIT_AUTHOR_NAME = user.name;
        env.GIT_COMMITTER_NAME = user.name;
        env.GIT_AUTHOR_EMAIL = user.email;
        env.GIT_COMMITTER_EMAIL = user.email;
        return env;
    },

    _init: function(){
        print(scope.getRoot());
        return this._exec("init");
    },
    _clone: function(from, as){
        var cmd = "clone " + from;
        if(as) cmd += " " + as;
        return this._exec( cmd );
    },
    getCurrentRev: function(){
        var ref = this._exec( "rev-parse HEAD" );

        var parsed = {rev: ref.out.trim()};

        ref.parsed = parsed;
        return ref;
    },

    showRef: function(ref){
        var ret =  this._exec( "show-ref " + ref );
        ret.parsed = {rev: ret.out.trim().split(/\s/)[0]};

        return ret;
    },

    getCommit: function(rev){
        var ret = this._exec( "log -n 1 "+rev );
        var parsed = {};

        var lines = ret.out.trim().split(/\n/);
        // lines[0] -> commit d3ce0cfde8ba...
        for(var i = 1; i < lines.length; i++){
            if(lines[i].indexOf(':') == -1) break;
            var header = lines[i].split(/:/);
            parsed[header[0].toLowerCase()] = header[1].trim();
        }

        // lines[i] -> blank
        ++i;
        var messagelines = lines.slice(i, lines.length).map(function(s){
            return s.substr(4);
        });
        parsed.message = messagelines.join('\n');

        ret.parsed = parsed;

        return ret;
    },

    listRevs: function(from, to){
        // Doesn't include rev:from
        var cmd = "log --first-parent --pretty=oneline "+from+".."+to;
        var ret = this._exec( cmd );
        var parsed = {};
        var lines = ret.out.trim().split(/\n/);
        var revs = [];
        // Reverse these -- git puts newest first
        for(var i = lines.length-1; i >= 0; --i){
            var space = lines[i].indexOf(" ");
            var id = lines[i].substring(0, space);
            var message = lines[i].substring(space+1);
            revs.push({id: id, message: message});
        }
        parsed.revs = revs;
        ret.parsed = parsed;
        return ret;
    },

    getCurrentBranch: function(){
        var cmd = "branch";
        var ret = this._exec( cmd );
        var lines = ret.out.split(/\n/);
        var branch;

        for(var i = 0; i < lines.length; i++){
            if(lines[i].match(/^\*/)){
                branch = lines[i].substr(2);
            }
        }

        ret.parsed = {};
        ret.parsed.branch = branch;
        return ret;
    },

    getCurrentHeadSymbolic: function(){
        var cmd = "symbolic-ref HEAD";
        var ret = this._exec( cmd );
        ret.parsed = {};
        ret.parsed.head = ret.out.trim();
        return ret;
    },

    push: function(){
        var ret = this._exec( "push" );
        ret.parsed = this._parsePush(ret);
        return ret;
    },
    _parsePush: function(exec){
        var parsed = {};
        var lines = exec.err.trim().split(/\n/);
        if( lines[0].match(/^updating/) ){
            var fromrev = lines[1].substring(lines[1].lastIndexOf(' ')+1);
            var torev = lines[2].substring(lines[2].lastIndexOf(' ')+1);
            parsed.from = fromrev;
            parsed.to = torev;
            parsed.success = true;
        }
        else if(exec.err.match(/-> \w*\n/)){
            // new-style git format
            var t = this;
            lines = lines.filter(function(l){ return l.match(/->/);});
            lines.forEach(function(l){
                var m = l.match(/([^\s]+) -> (.+)/);
                if(m[1] == t.getCurrentBranch().parsed.branch){
                    if(l[1] == '!') parsed.failed = true;
                    else {
                        m = l.match(/(\w+)\.\.(\w+)/);
                        parsed.from = m[1];
                        parsed.to = m[2];
                        parsed.success = true;
                    }
                }
            });
        }
        else {
            for(var i = 0; i < lines.length-1; ++i){
                var m = lines[i].match(/remote '.+?' is not a strict subset of local ref '(.+?)'/);
                if(m){
                    var ref = m[1];
                    if(ref == this.getCurrentHeadSymbolic().parsed.head)
                        parsed.pullFirst = true;
                }
                else if(lines[i][1] == "!") {
                    var m = lines[i].match(/([\w.]+) -> ([\w.]+) \((.+)\)/);
                    if(m[1] == this.getCurrentBranch().parsed.branch && m[3] == "non-fast forward"){
                        parsed.pullFirst = true;
                    }
                }
            }
            if(! parsed.pullFirst)
                parsed.upToDate = true;
        }

        return parsed;
    },

    pull: function(u){
        // Pass gitEnv when we are doing a pull.
        // The reason is that when we're doing a pull, we might make a merge
        // commit. We need the right information in the environment when
        // that happens.
        var ret = sysexec( "git pull" , "" , this._gitEnv(u) );
        ret.cmd = "git pull";
        ret.parsed = this._parsePull(ret);
        return ret;
    },
    _parsePull: function(exec){
        var parsed = {};
        var lines = exec.out.trim().split(/\n/);

        var created = {};
        var deleted = {};
        var changed = {};
        var conflicts = {};
        var mergetype;
        var failed;
        var merged;
        var upToDate;
        var success;

        var m;

        var parseMerge = function(start){
            if(start)
                var i = start;
            else {
                for(var i = 0; i < lines.length; ++i){
                    if(lines[i].match(/Merge made by/)) break;
                }
                ++i;
            }
            for(; i < lines.length; i++){
                if(lines[i].indexOf('|') == -1) break;
                var pipes = lines[i].split(/\|/);
                var filename = pipes[0].trim();
                var diffstat = pipes[1].trim();
                changed[filename] = diffstat;
            }
            // this line should be like:
            // "9 files changed, 211 insertions(+), 65 deletions(-)"
            ++i;

            for(; i < lines.length; i++){
                var line = lines[i];
                if(line.match(/^ create/)){
                    // FIXME: implement String.split(..., limit)
                    var firstFieldEnd = line.indexOf(/ /, 1);
                    var secondFieldEnd = line.indexOf(/ /, firstFieldEnd);
                    var thirdFieldEnd = line.indexOf(/ /, secondFieldEnd);
                    var filename = line.substring(thirdFieldEnd);
                    created[filename] = line;
                }
                else if( line.match(/^ delete /) ){
                    var firstFieldEnd = line.indexOf(/ /, 1);
                    var secondFieldEnd = line.indexOf(/ /, firstFieldEnd);
                    var thirdFieldEnd = line.indexOf(/ /, secondFieldEnd);
                    var filename = line.substring(thirdFieldEnd);
                    deleted[filename] = line;
                }
            }

        };

        if(lines.length > 0 && exec.out.match(/\nFast forward\n/)) {
            var fromrev = lines[0].substring(lines[0].lastIndexOf(" ")+1,
                lines[0].indexOf('.'));
            var torev = lines[0].substring(lines[0].lastIndexOf(".")+1);
            mergetype = "fastforward";
            parseMerge(2);

            success = true;
        }
        else if(lines.length > 0 && (m = exec.out.match(/Merge made by ([^\n]+)\./)) && m){
            mergetype = m[1];
            parseMerge();
            var errlines = exec.err.trim().split(/\n/);

            // Sometimes git doesn't have an output line saying which revisions were
            // pulled and merged. Thanks for nothing.
            for(var i = 0; i < errlines.length; ++i){
                if(m = errlines[i].match(/ ([0-9a-f]+)\.\.([0-9a-f]+)\s+([\w.]+)\s*->\s*([\w.+])/) && m){
                    if(m[3] != this.getCurrentBranch().parsed.branch) continue;
                    fromrev = m[1];
                    torev = m[2];
                    success = true;
                    break;
                }
            }

        }
        else if(lines.length == 1 && lines[0] == "Already up-to-date."){
            upToDate = true;
        }
        else {
            var m = exec.err.match(/fatal: Entry '([\.\w]+)' not uptodate\. Cannot merge\.\n$/);
            if(m){
                failed = {notuptodate: m[1]};
            }
            else {
                merged = {};
                conflicts = {};
                for(var i = 0; i < lines.length; i++){
                    var m = lines[i].match(/^Auto-merged/);
                    if(m){
                        merged[m[1]] = true;
                        continue;
                    }

                    var m = lines[i].match(/CONFLICT/);
                    if(m){
                        // FIXME: files with spaces in them??
                        var file = lines[i].substring(lines[i].lastIndexOf(' ')+1);
                        conflicts[file] = lines[i];
                    }

                }
                if(exec.err.match(/^Automatic merge failed/)){
                    failed = {conflicts: conflicts};
                }
            }

        }

        parsed.from = fromrev;
        parsed.to = torev;
        parsed.created = created;
        parsed.deleted = deleted;
        parsed.changed = changed;
        parsed.conflicts = conflicts;
        parsed.merged = merged;
        parsed.failed = failed;
        parsed.upToDate = upToDate;
        parsed.success = success;

        return parsed;
    },

    fetch: function(){
        var cmd = "fetch";
        return this._exec( cmd );
    },

    add: function(files){
        this._validate(files);

        var cmd = "add ";
        files.forEach( function( z ){ cmd += " " + z; } );
        return this._exec( cmd );
    },
    rm: function(files, opts){
        opts = opts || {};
        var cmd = "rm ";
        if(opts.cached) cmd += "--cached ";
        cmd += files.join(' ');
        return this._exec( cmd );
    },
    diff: function(files, opts){
        opts = opts || {};
        this._validate(files);
        var cmd = "diff ";
        if(opts.rev) cmd += opts.rev + " ";
        files.forEach( function( z ){ cmd += " " + z; } );
        if(files.length == 2){
            // Did you know that if you give git two files, it will sometimes
            // do an ordinary diff of those files -- i.e. not compare against
            // the index? You can force this behavior on by --no-index, but
            // there's no real way to force it off. Thanks guys!

            // Fortunately if we re-give one of those two files, we bring the number
            // of files up to three, thereby not triggering the behavior.
            // By luck, this doesn't change the output from what it should be --
            // files aren't displayed twice or anything.
            // We arbitrarily choose the first file here
            // (but we could just as easily choose the second)
            cmd += " " + files[0];
        }
        return this._exec( cmd );
    },
    commit: function(files, msg, u){
        if(!msg) throw "git commit needs a message";
        this._validate(files);
        var cmd = "git commit -F - ";

        cmd += " --author \"" + u.name + " <" + u.email + ">\" ";

        files.forEach( function( z ){ cmd += " " + z; } );
        log.git.repo.debug("committing; git command: " + cmd);
        var foo = sysexec( cmd , msg , this._gitEnv(u) );
        foo.cmd = cmd;
        return foo;
    },
    status: function(){
        var ret = this._exec("status");

        ret.parsed = this._parseStatus(ret);

        return ret;
    },
    _parseStatus: function(exec){
        var output = exec.out;
        var info = {};
        var stat = output.trim();
        var statlines = stat.split(/\n/);
        var currentState = ""; // "untracked", "changed", "staged", ??

        var filename = "";
        var filetype = "";
        var unmerged = [];
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

            var exec = statlines[i].match(/#\s+(modified|new file|unmerged|deleted|renamed):\s+(.+)$/);
            if(exec){
                filetype = exec[1];
                filename = exec[2];
                if(filetype == "renamed"){
                    parts = filename.split(/ -> /);
                    filename = parts[1];
                    oldfilename = parts[0];
                }
                file = {name: filename, type: filetype};
                if(filetype == "unmerged"){
                    unmerged.push(file);
                    continue;
                }
                if(filetype == "renamed"){
                    file.oldName = oldfilename;
                }
            }
            else {
                var exec = statlines[i].match(/#\s+(.+)$/);
                if (!exec) {
                	log.admingit("repo.js : _parseStatus() : Error : failed to parse " + statlines[i]);
                	return null;
                }
                file = {name: exec[1]};
            }

            if(! (currentState in info) ) info[currentState] = [];
            info[currentState].push(file);
        }

        if(unmerged.length > 0) info.unmerged = unmerged;

        return info;
    },
    checkout: function(files, opts){
        opts = opts || {};
        this._validate(files);
        var cmd = "checkout ";
        if(opts.force) cmd += "-f ";
        if(opts.rev) cmd += opts.rev + " ";
        cmd += files.join(" ");
        var ret = this._exec( cmd );
        if(ret.out.trim() == "" && ret.err.trim() == "")
            ret.parsed = {success: true};
        return ret;
    },

    mergeMessage: function(){
        // .git/MERGE_MSG
        // if it's not there, return null (not merging)
        var f = File.open('.git/MERGE_MSG');
        if(!f.exists()) return null;
        return f.asString();
    },
});

