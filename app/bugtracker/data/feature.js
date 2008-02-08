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
    this.status = app.bugtracker.Feature.STATUS.NEW;
    this.severity = app.bugtracker.Feature.SEVERITY.NORMAL;
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

app.bugtracker.Feature.STATUS = { NEW: 'new',
                                  REVIEWED: 'reviewed',
                                  FIXED: 'fixed',
                                  CLOSED: 'closed' };

app.bugtracker.Feature.SEVERITY = { NORMAL: 'normal',
                                    HIGH: 'high',
                                    LOW: 'low' };

// We need a standard way to bind a
