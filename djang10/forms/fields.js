core.djang10.util.object();
core.djang10.forms.widgets();

fields = { };


var Field
    = fields.Form
    = function(params) {

    params = {
        required: true,
        widget: null,
        label: null,
        initial: null,
        help_text: "",
        error_messages: {}

    }.merge(params || {});

    this.required = params.required;
    this.label = params.label;
    this.initial = params.initial;
    this.help_text = params.help_text;
    if(params.widget != null)
        this.widget = params.widget;
    
    //instantiate the widget if it needs it
    if (this.widget instanceof Function) {
        this.widget = new this.widget();
    }
    
    //get html attributes to apply for the curretn widget
    Object.extend(this.widget.attrs, this.widget_attrs(this.widget));
    
    //get error messages
    this.error_messages = {};

    //from base classes
    var prototypeStack = [];                
    for(var prototype = this.__proto__; prototype != null; prototype = prototype.__proto__)
        prototypeStack.push(prototype);
    while(prototypeStack.length > 0)
        this.error_messages.extend(prototypeStack.pop().default_error_messages);

    //from arguments
    this.error_messages.extend(params.error_messages);
};
Field.prototype = {
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
};


var CharField
    = fields.CharField
    = function(params) {

    params = {
        max_length: null, 
        min_length: null

    }.merge(params || {});
    
    this.max_length = params.max_length;
    this.min_length = params.min_length;
    
    Field.call(this);
};
CharField.prototype = {
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
        var attrs = {};
        
        if(this.max_length != null) {
            if(Object.instanceOf(widget, widgets.TextInput) 
                || Object.instanceOf(widget, widgets.PasswordInput)) {

                attrs["maxlength"] = this.max_length;
            }
        }
        
        return attrs;
    }
};


ValidationError = function(msg) {
    this.message = msg;
};
ValidationError.NON_FIELD_ERRORS = '__all__';

return fields;