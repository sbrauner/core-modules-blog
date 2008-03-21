core.ext.pluck();
core.io.marshal();


var bug = { _id : ObjectId( "47c869e6725a779e00de2b70" ) , status : "new" ,
    severity : "normal" , creationDate : new Date( 1204316647251 )  ,
    lastModified : new Date( 1205943594091 )  ,
    project :  {
        _id : ObjectId( "47cd61e9725a778b002ebb96" ),
        name : "Bug tracker" ,  areas : [
            {name : "ui" ,   owner : {
                _id : ObjectId( "47c44adf725a7716000d9cf2" ),
                name: "Kristina" , email: "kristina@10gen.com",
                nickname: "Kristina", permissions: ["admin"],
                pass_ha1_name: "BAD",
                pass_ha1_email: "BAD"}
            },
            {name: "aeaeaeae",   owner : null},
            {name: "ototototoot", owner : null},
            {name: "net",   owner : null}
        ] ,
        owner :   {_id : ObjectId( "47a0b2dc66a176d500f7d61b" ),
                   name: "Ethan",
                   email: "ethan@10gen.com",
                   nickname: "ethan",
                   permissions: [ "admin" ],
                   pass_ha1_name : "BAD" ,
                   pass_ha1_email : "BAD"
                  }
    },
            area : "" , type : "bug" , OS : "None" ,
            targetRelease : "" , title : "Test insensitivity",
            description : "Wheoooeo" , reporter : {
                _id : ObjectId( "47a0b2dc66a176d500f7d61b" ),  name : "Ethan",
                email : "ethan@10gen.com" ,  nickname : "ethan" ,
                permissions : [ "admin" ] ,
                pass_ha1_name : "BAD" ,  pass_ha1_email : "BAD"
            },
            owner : {_id : ObjectId( "47c44adf725a7716000d9cf2" ) ,
                     name : "Kristina" ,
                     email : "kristina@10gen.com" ,
                     nickname : "Kristina" ,
                     permissions : [ "admin" ],
                     pass_ha1_name : "b10a46264adb7d725d38215f5a1d81e9" ,
                     pass_ha1_email : "01de127f8262acf9feadde4412bf397d"},
            number : 1.0 , threaded_numPosts : 0.0  }

var bugspec = {
    title: true, id: "_id", number: true, owner: Ext.pluck("name"),
    status: true, severity: true, type: true,
    project: function(project){ return project? project.name : "none"},
    area: true
};

var output = io.Marshal(bug, bugspec);

assert(output.title == "Test insensitivity");
assert(output.owner == "Kristina");
assert(output.project == "Bug tracker");

assert(!("reporter" in output));
assert(!("threaded_numPosts" in output));
assert(!("lastModified" in output));

clone = function(obj){
    var newobj = {};
    for(var field in obj){
        newobj[field] = obj[field];
    }
    return newobj;
};

var bugs = [clone(bug), clone(bug), clone(bug)];

bugs[0].title = "Test slot 0";
bugs[0].owner = null;
bugs[1].title = "Test slot 1";
bugs[1].project = null;
bugs[2].title = "Test slot 2";

var output = io.Marshal(bugs, bugspec);

assert(output.length == bugs.length);
assert(output[0].title == "Test slot 0");
assert(output[0].owner == null);
assert(output[0].project == "Bug tracker");
assert(output[1].title == "Test slot 1");
assert(output[1].project == "none");
assert(output[1].owner == "Kristina");
assert(output[2].title == "Test slot 2");

