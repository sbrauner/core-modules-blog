core.content.html();

widgets = { };

var Widget
    = widgets.Widget
    = function(attrs) {

        this.attrs = attrs || {};
        this.instance = true;
};
Widget.prototype = {
    render: function(name, value, attrs){
        throw new NotImplementedError();
    },
    
    buildAttrs: function(extra_attrs){
        return this.attrs.merge(extra_attrs || {});
    },
    
    value_from_datadict: function(data, files, name){
        return data[name];
    },
    
    id_for_label: function(id){
        return id;
    }
};


//Input -------------------------------
var Input
    = widgets.Input
    = function(attrs) {

        Widget.call(this, attrs);
};
Input.prototype = {
    __proto__: Widget.prototype,
    
    input_type: null,
    
    render: function(name, value, attrs){
        var input_this = this;
        
        value = value || '';
        
        attrs = {
            type: input_this.input_type,
            name: name
        }.merge(attrs || {});
        
        attrs = this.buildAttrs(attrs);
        if (value != '' && value != null) 
            attrs["value"] = value;
        
        return '<input ' + flatten_attributes(attrs) + ' />';
    }
};

//TextInput --------------------------------------
var TextInput
    = widgets.TextInput
    = function() {

        Input.call(this);
};
TextInput.prototype = {
    __proto__ : Input.prototype,

    input_type: "text"
};

// PasswordInput -------------------
var PasswordInput
    = widgets.PasswordInput
    = function(params) {
 
    params = {
        attrs: null,
        render_value: true

    }.merge(params || {});
    
    Input.call(this, params.attrs);
    
    this.render_value = params.render_value;
};
PasswordInput.prototype = {
    __proto__ : Input.prototype,

    input_type: "password",

    render: function(name, value, attrs) {
        if(!this.render_value) value = null;
        return Input.prototype.render.call(this, name, value, attrs);
    }
};


//HiddenInput ----------------------
var HiddenInput
    = widgets.HiddenInput
    = function() {

    Input.call(this);
    
    this.input_type = "hidden";
    this.is_hidden = true;
};
HiddenInput.prototype = {
    __proto__: Input.prototype,

    input_type: "hidden",
    is_hidden: true
};

//Private Helpers -----------------------
var flatten_attributes = function(dict) {
    var buffer = "";
    var isFirst = true;
    
    for(var key in dict) {
        if(!isFirst)
            buffer += ' ';
        buffer += (key + '=' + '"' + content.HTML.escape(dict[key]) + '"');
        
        isFirst = false;
    }
    return buffer;
}

//TODO: move elsewhere
NotImplementedError = function(msg) {
    this.msg = msg;
};

return widgets;