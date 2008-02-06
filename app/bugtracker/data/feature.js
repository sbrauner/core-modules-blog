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
    app.bugtracker.Feature.STATUS = Object();
    app.bugtracker.Feature.STATUS.NEW = 'new';
    app.bugtracker.Feature.STATUS.REVIEWED = 'reviewed';
    app.bugtracker.Feature.STATUS.FIXED = 'fixed';
    app.bugtracker.Feature.STATUS.CLOSED = 'closed';

    app.bugtracker.Feature.SEVERITY = Object();
    app.bugtracker.Feature.SEVERITY.NORMAL = 'normal';
    app.bugtracker.Feature.SEVERITY.HIGH = 'high';
    app.bugtracker.Feature.SEVERITY.LOW = 'low';

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
};

// We need a standard way to bind a 