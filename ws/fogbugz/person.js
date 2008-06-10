
ws.FogBugz.Person = function( xml ){
    if ( xml ){
        for ( var i=0; i<xml.elements.length; i++ ){
            var e = xml.elements[i];
            if ( e.textString )
                this[ e.localName ] = e.textString;
        }
    }
};

ws.FogBugz.Person.prototype.toString = function(){
    return this.sFullName;
}
