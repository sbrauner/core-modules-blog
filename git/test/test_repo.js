core.core.file();


scope.makeThreadLocal();
log.git.tests.level = log.LEVEL.ERROR;

u = {name: "Test Framework", email: "test@10gen.com"};

sysexec("rm -r /tmp/gitrepo");
sysexec("mkdir -p /tmp/gitrepo/test");

var repoAt = function(root){
    var s = scopeWithRoot(root);
    s.eval("core.git.repo()");
    git.Repo.prototype.checkStatus = gr_checkStatus;
    git.Repo.prototype.dumpFile = gr_dumpFile;
    var g = new git.Repo();
    g.root = root;
    return g;
};


gr_checkStatus = function(spec){
    var info = this.status().parsed;

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
                   (desired == actual[j].name) ||
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

var gr_dumpFile = function(file, contents){
    var f = File.create(contents);
    f.writeToLocalFile(this.root + "/" + file);
};

var g = repoAt("/tmp/gitrepo/test");

g._init();

assert(g.checkStatus({}));

openFile("/tmp/gitrepo/test/file1").touch();

assert(g.checkStatus({ untracked: ["file1"] }));

log.git.tests.debug(tojson(g.add(["file1"])));

assert(g.checkStatus({ staged: [{name: "file1", type: "new file"}] }));

log.git.tests.debug(tojson(g.commit(["file1"], "test commit", u)));

var startCommit = g.getCurrentRev().parsed.rev;

assert(g.getCommit(startCommit).parsed.message == "test commit");

// All changes are gone
assert(g.checkStatus({ }));

// Clone
// easiest way to do that is to make a repo in the parent directory and use
// the sysexec from the repo

var g2 = repoAt("/tmp/gitrepo");
log.git.tests.debug(tojson(g2._clone("/tmp/gitrepo/test", "test2")));


var g3 = repoAt("/tmp/gitrepo/test2");
assert(g3.checkStatus({}));

assert(startCommit == g3.getCurrentRev().parsed.rev);


// Commit "upstream"

g.dumpFile("file1", "hi there\n");

assert(g.diff([]).out.match(/\n\+hi there\n/));

log.git.tests.debug(tojson(g.commit(["file1"], "test commit 2", u)));

var endCommit = g.getCurrentRev().parsed.rev;
assert(g.getCommit(endCommit).parsed.message == "test commit 2");

// Try a pull on g3

var pull = g3.pull(u);

var s = File.open('/tmp/gitrepo/test2/file1').asString();

assert(s == "hi there\n");


assert(pull.parsed);
assert(startCommit.match(pull.parsed.from));
assert(endCommit.match(pull.parsed.to));
assert("file1" in pull.parsed.changed);



// Commit to g3 and push to g1

g3.dumpFile("file1", "hello there\n");

assert(g3.diff([]).out.match(/\n\+hello there\n/));
assert(g3.diff([]).out.match(/\n\-hi there\n/));

log.git.tests.debug(tojson(g3.commit(["file1"], "test commit 3", u)));

var lastCommit = g3.getCurrentRev().parsed.rev;

assert(g3.getCommit(lastCommit).parsed.message == "test commit 3");

var push = g3.push();

log.git.tests.debug(tojson(g.checkout([], {force: true, rev: "HEAD"})));

var s = File.open('/tmp/gitrepo/test/file1').asString();

assert(s == "hello there\n");

assert(push.parsed);
assert(endCommit.match(push.parsed.from));
assert(lastCommit.match(push.parsed.to));
assert(! push.parsed.pullFirst);

// commit changes to both g1 and g3 (make conflicts)

g.dumpFile("file1", "howdy there\n");
g.commit(["file1"], "revise with howdy", u);

g3.dumpFile("file1", "yo there\n");
var pull = g3.pull(u);

assert(pull.parsed.failed.notuptodate == "file1");

g3.commit(["file1"], "revise with yo", u);
var push = g3.push();

assert(push.parsed.pullFirst);

pull = g3.pull(u);

assert(pull.parsed.failed.conflicts.file1);

var status = g3.status();

assert(status.parsed.unmerged[0].name == "file1");

var listRevs = g.listRevs(startCommit, lastCommit);

assert(listRevs.parsed.revs[0].id == endCommit);
assert(listRevs.parsed.revs[0].message == "test commit 2");
assert(listRevs.parsed.revs[1].id == lastCommit);
assert(listRevs.parsed.revs[1].message == "test commit 3");

sysexec("mv /tmp/gitrepo/test/file1 /tmp/gitrepo/test/file2");
g.rm(["file1"]);
g.add(["file2"]);

var status = g.status();
assert(status.parsed.staged.length == 1);
assert(status.parsed.staged[0].oldName == "file1");
assert(status.parsed.staged[0].name == "file2");

// FIXME: try a push on a branch when another branch is not a local subset
// obviously we don't support branches at all yet, but you could do a sysexec
// to create branches or whatever

// FIXME: test rm

// FIXME: test fetch

sysexec("rm -r /tmp/gitrepo");


