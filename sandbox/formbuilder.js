// TODO: validation
// http://www.formbuilder.org/download/CGI-FormBuilder-3.0501/docs/CGI/FormBuilder.html
// fieldset?
// allow templates?

core.util.format();

sandbox.FormBuilder = function (args){
    this._fields = {};
    this._attr = Object.extend({}, args.attr);

    this._attr.method = this._attr.method || args.method || 'GET';
    this._attr.action = this._attr.action || args.action;
    this._attr["class"] = this._attr['class'] || this._attr.className || args.className || "fb";
    delete this._attr.className;

    for(var i = 0; i < args.fields.length; i++){
        this._fields[args.fields[i]] = new sandbox.FormBuilder.Field(this);
    }

    this._values = args.values || {};
    this._required = args.required || [];
};


sandbox.FormBuilder.prototype.field = function(name, args){
    if(! (name in this._fields))
        this._fields[name] = new sandbox.FormBuilder.Field(this);
    this._fields[name].field(args);
};

sandbox.FormBuilder.prototype.render = function(){
    var s = "<form";
    s += " " + Util.format_htmlattr(this._attr);
    s += ">"
    for(var key in this._fields){
        s += this._fields[key].render(key);
    }

    s += "</form>";
    return s;
};


sandbox.FormBuilder.Field = function (form){
    args = args || {};
    this._form = form;
    this._options = {};
    this._options.viewfunc = function(o){ return tojson(o); };
};

sandbox.FormBuilder.Field.prototype.field = function(args){
    for(var key in args){
        this._options[key] = args[key];
    }
};

sandbox.FormBuilder.Field.prototype.render = function(name){
    var options = this._options.options;
    var defvalue = this._options.defvalue;
    var label = this._options.label || name;
    var multiple = this._options.multiple;
    var s = label + ": ";
    if(options == null){
        return s + "<input type='text' name='"+name+"'" +
            (defvalue ? (" value='"+defvalue + "'") : "") +
            "/>";
    }
    if(options.length >= this._form._selectnum){
        s += "<select name='"+name+"'>";
        for(var i = 0; i < options.length; i++){
            s += "<option";
            var v = options[i];
            if(v == null) {
                s += " value='$null$'>None"
            }
            else {
                if(v._id) {
                    s += " value='" + v._id + "'";
                }
                s += ">" + this._options.viewfunc(v);
            }
            s += "</option>";
        }
        s += "</select>";
        return s;
    }
    if(this._options.multiple){
        for(var i = 0; i < options.length; i++){
            s += "<input type='checkbox' name='"+name+"' value='"+options[i]+"'/>";
        }
        return s;
    }
    if(options._length == 1){
        s += "<input type='checkbox' name='"+name+"' value='"+options[0]+"'/>";
        return s;
    }

    for(var i = 0; i < options.length; i++){
        s += "<input type='radio' name='"+name+"' value='"+options[i]+"'/>";
    }
    return s;
};

