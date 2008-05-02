core.admin.data.bash();
core.core.file();

sysexec("rm -r testbash");
sysexec("mkdir -p testbash");

var sh = new admin.data.Bash();

var currentContents = {};

var dumpFile = function(filename, contents){
    var f = File.create(contents);
    currentContents[filename] = contents;
    scope._fileRoot = '.';
    // This is a hack; writing to a local file in /home fails on my machine
    // (I think because it can't be done atomically, since /tmp is on a different
        // hard drive partition).
    f.writeToLocalFile('/tmp/blah');
    sysexec("mv /tmp/blah "+ filename);

};

var fileCorrect = function(filename, matchfile){
    var contents = currentContents[matchfile || filename];
    var foo = sh.cat([filename]);
    assert(foo.out == contents);
    assert(foo.err == "");
};

var silent = function(result){
    assert(result.out == "" && result.err == "");
};

var assertThrows = function(f){
    var exc = null;
    try{
        f();
    }
    catch (e){
        exc = e;
    }
    assert(exc);
};

dumpFile('testbash/file1', 'hi there\n');

fileCorrect('testbash/file1');

var foo = sh.cat(["nonexistent file"]);
assert(foo.out == "");
assert(foo.err != ""); // dunno exactly what error you'd get

silent(sh.mv(['testbash/file1', 'testbash/file2']));

fileCorrect('testbash/file2', 'testbash/file1');

var foo = sh.ls(['testbash']);
assert(foo.out == "file2\n");
assert(foo.err == "");

silent(sh.cp(['testbash/file2', 'testbash/file3']));

fileCorrect("testbash/file3", "testbash/file1");

var foo = sh.ls(['testbash']);
assert(foo.out == 'file2\nfile3\n');
assert(foo.err == "");

dumpFile('testbash/longfile',
         [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].join('\n'));

var foo = sh.head(['testbash/longfile']);
assert(foo.out == [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].join('\n') + '\n');
assert(foo.err == "");

var foo = sh.tail(['testbash/longfile']);
assert(foo.out == [4, 5, 6, 7, 8, 9, 10, 11, 12, 13].join('\n') + "\n");
assert(foo.err == "");

var foo = sh.head(['testbash/longfile', '-n', '4']);
assert(foo.out == [1, 2, 3, 4].join('\n') + '\n');
assert(foo.err == "");

silent(sh.diff(['testbash/file2', 'testbash/file3']));

silent(sh.grep(['a', 'testbash/longfile']));
var foo = sh.grep(['2', 'testbash/longfile']);
assert(foo.out == '2\n12\n');
assert(foo.err == "");

silent(sh.rm(['testbash/file2']));

var foo = sh.ls(['testbash']);
assert(foo.out == 'file3\nlongfile\n');
assert(foo.err == "");

var foo = sh.date(['-d', '2008-04-20', '"+%Y %m %M"']);
assert(foo.out == "2008 04 00\n");
assert(foo.err == "");

sh.cd(['testbash']);

var foo = sh.ls();
assert(foo.out == 'file3\nlongfile\n');
assert(foo.err == "");

fileCorrect('file3', 'testbash/file1');

sh.cd(['../testbash']);

var foo = sh.ls();
assert(foo.out == 'file3\nlongfile\n');
assert(foo.err == "");

fileCorrect('file3', 'testbash/file1');

assertThrows(function(){ sh.cd(['../..']); });

// Prove that you can't cd out using an absolute path
silent(sh.cd(['/']));

silent(sh.cd(['testbash']));

var inTestbash = function(){
    assert(sh.pwd().out == "testbash\n" || sh.pwd().out == "testbash/\n");
};

inTestbash();

silent(sh.cd(['//..////testbash//']));

inTestbash();

assertThrows(function(){ sh.rm(['../testbash/file3']); });

inTestbash();

assertThrows(function(){ sh.rm(['./../../testbash/file3']); });

inTestbash();

assertThrows(function(){ sh.rm(['./..']); });

inTestbash();

// valid filenames
var foo = sh.ls(['..foo']);

assert(foo.out == "");
assert(foo.err != "");
