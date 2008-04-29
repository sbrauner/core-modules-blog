admin.MAX_HISTORY_LENGTH = 40;

core.db.db();

admin.data.ShellSession = function(user){
    // Array of commands.
    this.commands = [];
    this.inputs = [];
    this.commands._dbCons = admin.data.ShellSession.Commmand;

    // DBRef to db.users
    this.user = user || null;
};

db.shell.sessions.setConstructor(admin.data.ShellSession);
dbutil.associate(admin.data.ShellSession, db.shell.sessions);

admin.data.ShellSession.prototype.push = function(input, output){
    this.commands.push(new admin.data.ShellSession.Command(input, output));
};

Object.extend(admin.data.ShellSession.prototype, {
    getCommands : function(){
        return this.commands.map(Ext.pluck('input'));
    },
    getResults : function(){
        return this.commands.map(Ext.pluck('output'));
    },

    presave: function(){
        if(this.commands.length > admin.MAX_HISTORY_LENGTH){
            this.commands.splice(0, this.commands.length - admin.MAX_HISTORY_LENGTH);
        }
    }
});

admin.data.ShellSession.Command = function(input, output){
    this.input = input || "";
    // Results objects stored as as JSON strings.
    // We can't store results themselves, because results objects often have
    // DBRefs. If we reload those DBRefs, the objects themselves will change.
    this.output = output || "";
    this.timestamp = new Date();
};
