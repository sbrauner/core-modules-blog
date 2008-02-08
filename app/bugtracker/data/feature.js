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
    this.status = app.bugtracker.data.Feature.STATUS.NEW;
    this.severity = app.bugtracker.data.Feature.SEVERITY.NORMAL;
    this.creationDate = new Date();
    this.lastModified = new Date();
    this.product = '';
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

app.bugtracker.data.Feature.prototype.presave = function(){
    this.number = parseInt(this.number);
};

if(db){
    db.bugtracker.features.setConstructor(app.bugtracker.data.Feature);
    db.bugtracker.features.ensureIndex({number: 1});
    db.bugtracker.features.ensureIndex({owner: 1});
    db.bugtracker.features.ensureIndex({reporter: 1});
    db.bugtracker.features.ensureIndex({lastModified: 1});
}

app.bugtracker.data.Feature.nextNumber = function(){
    fs = app.bugtracker.data.Feature.find().sort({number: -1}).limit(1);
    n = fs.next();
    return  n.number+1;
};

app.bugtracker.data.Feature.find = function(){
    return db.bugtracker.features.find();
};

// We need a standard way to bind a  -dana
// .. member variable to a set of options. -ethan
