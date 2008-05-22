core.content.html();

widgets = { };

var define = function(name, cons, proto) {
    cons.prototype = proto;
    scope.getParent()[name] = cons;
    widgets[name] = cons;
};

define(
    "Widget",
    function(attrs) {
        log("new Widget");
        this.attrs = attrs || {};
        
        this.instance = true;
    },
    {
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
    }
);


//Input -------------------------------
define(
    "Input",
    function(attrs) {
        Widget.call(this, attrs);
    },
    {
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
    }
);

log("Input Done");

//TextInput --------------------------------------
define(
    "TextInput",
    function() {
        Input.call(this);
    },
    {
        __proto__ : Input.prototype,
    
        input_type: "text"
    }
);

// PasswordInput -------------------
define(
    "PasswordInput",
    function(params) {
        params = {
            attrs: null,
            render_value: true
    
        }.merge(params || {});
        
        Input.call(this, params.attrs);
        
        this.render_value = params.render_value;
    },
    {
        __proto__ : Input.prototype,
    
        input_type: "password",
    
        render: function(name, value, attrs) {
            if(!this.render_value) value = null;
            return Input.prototype.render.call(this, name, value, attrs);
        }
    }
);


//HiddenInput ----------------------
define(
    "HiddenInput",
    function() {
        Input.call(this);
        
        this.input_type = "hidden";
        is_hidden = true;
    },
    {
        __proto__: Input.prototype,
    
        input_type: "hidden",
        is_hidden: true
    }
);
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
