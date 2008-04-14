
u = {name: "Test Framework", email: "<test@10gen.com>"};


sysexec("rm -r /tmp/gitrepo/test");
sysexec("mkdir -p /tmp/gitrepo/test");

s = scopeWithRoot("/tmp/gitrepo/test");
s.eval("core.git.repo()")
s.eval("core.core.file()");

var g = new git.Repo();

g._init();

var parseStatus = function(){
    var info = {};
    var stat = g.status().out.trim();
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

        if(statlines[i].match(/use \"git /))
            // We don't need usage advice, thanks
            continue;

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
};

var checkStatus = function(spec){
    var info = parseStatus();

    for(var field in spec){
        if(! (field in info) ){
            log("couldn't match against " +field + " in " + tojson(info));
            return false;
        }

        var files = spec[field];
        var actual = info[field];
        //delete spec[field]; // that would be concurrent access, naughty
        delete info[field];

        for(var i = 0; i < files.length; i++){
            var desired = files[i];

            // Find a file in actual that matches the desired one
            for(var j = 0; j < actual.length; ++j){
                if((desired == actual[j]) ||
                   (desired.name && (desired.name == actual[j].name)))
                    break;
            }

            // No match
            if(j >= actual.length){
                log("couldn't find a file like " + tojson(desired) + " in " + tojson(actual));
                return false;
            }
            // Names matched, but for some reason the type is different
            if(desired.type && desired.type != actual[j].type){
                log("type doesn't match for file " + desired.name + "; " + desired.type + " != " + actual[j].type);
                return false;
            }

            // OK, we got a match; let's remove it
            actual.splice(j, 1);
        }

        // Any files left in actual?
        if(actual.length > 0){
            log("files left in actual output: " + tojson(actual));
            return false;
        }
    }

    if(Object.keys(info).length > 0){
        log("files left in info " + tojson(info));
        return false;
    }

    return true;
};

assert(checkStatus({}));

openFile("/tmp/gitrepo/test/file1").touch();

assert(checkStatus({ untracked: ["file1"] }));

print(tojson(g.add(["file1"])));

assert(checkStatus({ staged: [{name: "file1", type: "new file"}] }));

print(tojson(g.commit(["file1"], "test commit", u)));

// All changes are gone
assert(checkStatus({ }));

var f = File.create("hi there\n");
f.writeToLocalFile('/tmp/gitrepo/test/file1');

assert(g.diff([]).out.match(/\n\+hi there\n/m));

print(tojson(g.commit(["file1"], "test commit 2", u)));


sysexec("rm -r /tmp/gitrepo/test");
