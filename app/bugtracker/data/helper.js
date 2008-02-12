app.bugtracker.data.helper = {
    select: function(obj, field, prefix, opts, conf){
        if(! conf) conf = { view: null, value: null };
        var viewfunc = conf.view;
        delete conf.view;
        var valuefunc = conf.value;
        delete conf.value;
        s = "";
        s += "<select name=\""+prefix+field+"\" "+app.bugtracker.data.helper.format(conf)+">";
        var orig = obj[field];
        if(! opts){
            var field_c = field.toUpperCase();
            var opts = obj[field_c];
        }
        for(var f in opts){
            var text = opts[f];
            if(viewfunc) text = viewfunc(text);
            var val = opts[f];
            if(valuefunc) val = valuefunc(val);
            s += "<option";
            // This paranoid check prevents the possibility of opts[f] being
            // false or null and getting an exception when you access
            // opts[f]._id.
            // We use this in bugtracker by passing a list of options for Users,
            // of which one is a false "No user selected" object.
            // We need to be able to check if this was the selected user, but we
            // also need to be able to check if this wasn't.
            // If opts[f] is some string, then ._id for both objects will be
            // null, so don't accept that.
            if((opts[f] == orig) || (opts[f] && opts[f]._id && orig && orig._id && opts[f]._id == orig._id))
                s += " selected=1"

            if(opts[f] != val)
                s += " value=\""+ val +"\"";
            s += ">";
            s += text;
            s += "</option>";
        }
        s += "</select>";
        return s;
    },
    format: function(obj){
        // Transform an object full of k:v pairs to a string full of "k=\"v\""
        // elements (for embedding as attributes in an HTML element).
        //
        // Useful after you've removed all the excess parameters for your function.
        s = "";
        for(var prop in obj){
            s += prop + "=";
            s += '"' + obj[prop] + '"' + " ";
        }
        return s;
    }

};
