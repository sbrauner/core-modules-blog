app.bugtracker.data.helper = {
    select: function(obj, field, prefix){
        s = "";
        s += "<select name=\""+prefix+field+"\">";
        var orig = obj[field];
        var field_c = field.toUpperCase();
        var opts = obj[field_c];
        for(var f in opts){
            if(opts[f] == orig)
                s += "<option selected=1>";
            else
                s += "<option>";
            s += opts[f];
            s += "</option>";
        }
        s += "</select>";
        return s;
    }
};
