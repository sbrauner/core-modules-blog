core.util.format();
app.bugtracker.data.helper = {
    select: function(obj, field, prefix, opts, conf){
        // Return the HTML for a select element, with options given by opts.
        // Give the select element the name of the field, plus a prefix.
        // Mark selected the option which is the same as obj[field].

        // conf can specify a view element, which is a function to render the
        // text for an option, and a value element, which is a function to
        // render the value for an option.

        // If opts aren't provided, they default to obj[FIELD]. This is a
        // cute, but possibly not very useful default.

        if(! conf) conf = { view: null, value: null };
        var viewfunc = conf.view;
        delete conf.view;
        var valuefunc = conf.value;
        delete conf.value;
        var compare = conf.compare || function(a, b) { return false; };
        delete conf.compare;
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
            if((opts[f] == orig) || (opts[f] && opts[f]._id && orig && orig._id && opts[f]._id == orig._id) ||
               (compare(opts[f], orig)))
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
    format: Util.format_htmlattr

};
