/* this should contain generic functionality for invoking a logging system in a web browser */

log.Client = function() {};

var createLogReaderCode = '<script type="text/javascript">\n' +
                            'createLogReader = new function() { logReader = new YAHOO.widget.LogReader(); };\n' +
                            'YAHOO.util.Event.onDOMReady(createLogReader);' + 
                            '</script>';
//BROKEN
log.Client.Install = function() {
    head.push('<link type="text/css" rel="stylesheet" href="/@@/yui/current/logger/assets/skins/sam/logger.css"/>');
    head.push('<script type="text/javascript" src="/@@/yui/current/logger/logger.js"></script>');
//    head.push(createLogReaderCode);
};