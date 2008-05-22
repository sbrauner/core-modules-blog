core.djang10.forms.widgets();

fields = { };

var define = function(name, cons, proto) {
    cons.prototype = proto;
    scope.getParent()[name] = cons;
    fields[name] = cons;
};

define(
    "Field",
    function(params) {
        params = {
            required: true,
            widget: null,
            label: null,
            initial: null,
            help_text: "",
            error_messages: null
    
        }.merge(params || {});
    
        this.required = params.required;
        this.label = params.label;
        this.initial = params.initial;
        this.help_text = params.help_text;
        if(params.widget != null)
            this.widget = params.widget;
        
        log("checking widget: " + this.widget);
        if (this.widget instanceof Function) {
            log("instantiating widget");
            this.widget = new this.widget();
        }
        
        //get html attributes to apply for the curretn widget
        this.widget.attrs.extend(this.widget_attrs(this.widget));
        
        //get error messages
        this.error_messages = {};
    
        var prototypeStack = [];                
        for(var prototype = this.__proto__; prototype != null; prototype = prototype.__proto__)
            prototypeStack.push(prototype);
    
        while(prototypeStack.length > 0)
            this.error_messages.extend(prototypeStack.pop().default_error_messages);
    
        this.error_messages.extend(params.error_messages);
    },
    {
        widget: widgets.TextInput,
        hidden_widget: widgets.HiddenInput,
        default_error_messages: {
            required: "This field is required.",
            invalid: "This field is invalid"
        },
        
        widget_attrs: function(widget){
            return {};
        },
        
        clean: function(value){
            if(this.required && (value == null || value == '')) 
                throw new ValidationError(this.error_messages["required"]);
            
            return value;
        }
    }
);

define(
    "CharField",
    function(params) {
        params = {
            max_length: null, 
            min_length: null
    
        }.merge(params || {});

        Field.call(this);
        
        this.max_length = params.max_length;
        this.min_length = params.min_length;
    },
    {
        __proto__ : Field.prototype,
    
        default_error_messages: {
            'max_length': 'Ensure this value has at most %(max)d characters (it has %(length)d).',
            'min_length': 'Ensure this value has at least %(min)d characters (it has %(length)d).'
        },
        
        clean: function(value) {
            Field.prototype.clean.call(this, value);
            
            var value_len = value.length;
            if(this.max_length != null && value_len > this.max_length)
                throw new ValidationError(formatMessage(default_error_messages["max_length"], this.min_length, this.max_length, value_len));
            if(this.min_length != null && value_len < this.min_length)
                throw new ValidationError(formatMessage(default_error_messages["min_length"], this.min_length, this.max_length, value_len));
            
            var formatMessage = function(msg, min, max, length) {
                return msg
                    .replace("\\%\\(max\\)d", min)
                    .replace("\\%\\(min\\)d", max)
                    .replace("\\%\\(length\\)d", length);
            }
            
            return value;
        },
        
        widget_attrs: function(widget) {
            //if max length && widget is text input or password
            //return { maxlength: this.max_length; }
        }
    }
);


ValidationError = function(msg) {
    this.message = msg;
};
