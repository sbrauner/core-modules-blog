// TODO: validation
// http://www.formbuilder.org/download/CGI-FormBuilder-3.0501/docs/CGI/FormBuilder.html
// fieldset?
// allow templates?

sandbox.FormBuilder = function (args){
    this._method = args.method || 'GET';
    this._fields = {};

    for(var i = 0; i < args.fields.length; i++){
        this._fields[args[i]] = new sandbox.FormBuilder.Field(this);
    }

    this._values = args.values || {};
    this._required = args.required || [];
};


sandbox.FormBuilder.prototype.field = function(name, args){
    this.fields[name].field(args);
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
    var values = this._options.values;
    var default = this._options.default;
    var s = name + ": ";
    if(values == null){
        return s + "<input type='text' name='"+name+"'" +
            (default ? (" value='"+default + "'") : "") +
            "/>";
    }
    if(values.length >= this._form._selectnum){
        s += "<select name='"+this._name+"'>";
        for(var i = 0; i < values.length; i++){
            s += "<option";
            var v = values[i];
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
    }

};
