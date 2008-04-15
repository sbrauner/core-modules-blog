core.core.file();

u = {name: "Test Framework", email: "test@10gen.com"};

sysexec("rm -r /tmp/gitrepo");
sysexec("mkdir -p /tmp/gitrepo/test");

var repoAt = function(root){
    var s = scopeWithRoot(root);
    s.eval("core.git.repo()");
    git.Repo.prototype.parseStatus = gr_parseStatus;
    git.Repo.prototype.checkStatus = gr_checkStatus;
    return new git.Repo();
};

gr_parseStatus = function(){
    var info = {};
    var stat = this.status().out.trim();
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

gr_checkStatus = function(spec){
    var info = this.parseStatus();

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

var g = repoAt("/tmp/gitrepo/test");

g._init();

assert(g.checkStatus({}));

openFile("/tmp/gitrepo/test/file1").touch();

assert(g.checkStatus({ untracked: ["file1"] }));

print(tojson(g.add(["file1"])));

assert(g.checkStatus({ staged: [{name: "file1", type: "new file"}] }));

print(tojson(g.commit(["file1"], "test commit", u)));

// All changes are gone
assert(g.checkStatus({ }));

// Clone
// easiest way to do that is to make a repo in the parent directory and use
// the sysexec from the repo

var g2 = repoAt("/tmp/gitrepo");
print(tojson(g2._clone("/tmp/gitrepo/test", "test2")));


var g3 = repoAt("/tmp/gitrepo/test2");
assert(g3.checkStatus({}));


// Commit "upstream

var f = File.create("hi there\n");
f.writeToLocalFile('/tmp/gitrepo/test/file1');

assert(g.diff([]).out.match(/\n\+hi there\n/));

print(tojson(g.commit(["file1"], "test commit 2", u)));

// Try a pull on g3

print(tojson(g3.pull()));

var s = File.open('/tmp/gitrepo/test2/file1').asString();

assert(s == "hi there\n");

// Commit to g3 and push to g1

var f = File.create("hello there\n");
f.writeToLocalFile('/tmp/gitrepo/test2/file1');

assert(g3.diff([]).out.match(/\n\+hello there\n/));
assert(g3.diff([]).out.match(/\n\-hi there\n/));

print(tojson(g3.commit(["file1"], "test commit 3", u)));

print(tojson(g3.push()));

print(tojson(g.checkout([], {force: true, rev: "HEAD"})));

var s = File.open('/tmp/gitrepo/test/file1').asString();

assert(s == "hello there\n");

sysexec("rm -r /tmp/gitrepo");


