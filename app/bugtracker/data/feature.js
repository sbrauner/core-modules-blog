/**
 * Bug/Feature Tracking System
 *
 * Specification: http://www.xmlrpc.com/spec
 *
 * @author Dana Spiegel (dana@10gen.com)
 * @created Feb 06, 2008
 * @updated Feb 06, 2008
**/

app.bugtracker.data.Feature = function() {
     // member variables
    this.status = this.STATUS.NEW;
    this.severity = this.SEVERITY.NORMAL;
    this.creationDate = new Date();
    this.lastModified = new Date();
    this.project = null;
    this.area = "";
    this.type = '';
    this.OS = '';
    this.targetRelease = '';
    this.title = '';
    this.description = '';
    this.reporter = '';
    this.owner = '';
    this.number = 0;
};

app.bugtracker.data.Feature.prototype.STATUS = { NEW: 'new',
                                  REVIEWED: 'reviewed',
                                  FIXED: 'fixed',
                                  CLOSED: 'closed' };

app.bugtracker.data.Feature.prototype.SEVERITY = { NORMAL: 'normal',
                                    HIGH: 'high',
                                    LOW: 'low' };

app.bugtracker.data.Feature.prototype.TYPE = { BUG: 'bug',
                                    FEATURE: 'feature',
                                    INQUIRY: 'inquiry' };

core.threaded.data.reply_parent();
threaded.repliesEnabled(app.bugtracker.data, "Feature");


app.bugtracker.data.Feature.prototype.presave = function(){
    this.number = parseInt(this.number);
    this.description = this.description.trim();
    this.title = this.title.trim();
    this.targetRelease = this.targetRelease.trim();
};

if(db){
    db.bugtracker.cases.setConstructor(app.bugtracker.data.Feature);
    db.bugtracker.cases.ensureIndex({number: 1});
    db.bugtracker.cases.ensureIndex({lastModified: 1});
    db.bugtracker.cases.ensureIndex({severity: 1});
}

app.bugtracker.data.Feature.nextNumber = function(){
    fs = app.bugtracker.data.Feature.find().sort({number: -1}).limit(1);
    if(fs.hasNext())
        return fs.next().number+1;
    else return 1;
};

app.bugtracker.data.Feature.find = function(){
    return db.bugtracker.cases.find();
};

// We need a standard way to bind a  -dana
// .. member variable to a set of options. -ethan
