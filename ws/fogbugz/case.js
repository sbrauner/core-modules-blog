
ws.FogBugz.Case = function( xml ){
    this.ixBug = null;
    if ( xml ){
        this.ixBug = xml.attributes.ixBug;
        for ( var i=0; i<xml.elements.length; i++ ){
            var e = xml.elements[i];
            if ( e.textString )
                this[ e.localName ] = e.textString;
        }
    }
};

ws.FogBugz.Case.prototype.setTitle = function( title ){
    this.sTitle = title;
};


ws.FogBugz.Case.prototype.setProject = function( project ){
    this.sProject = project;
};

ws.FogBugz.Case.prototype.setArea = function( area ){
    this.sArea = area;
};


ws.FogBugz.Case.prototype.setDescription = function( desc ){
    this.sEvent = desc;
};

ws.FogBugz.Case.prototype.toString = function(){
    var s =  "[ FogBugz Case " + this.id + " " + this.sProject + ":" + this.sTitle + "\n";
    
    s += "\t status:" + this.ixStatus + "\n";
    s += "\t priority:" + this.ixPriority + "\n";
    s += "\t assigned to:" + this.sPersonAssignedTo + "\n";
    
    s += "]";
    return s;
}
