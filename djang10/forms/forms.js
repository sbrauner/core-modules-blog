core.djang10.util.object();
core.djang10.forms.fields();


forms = { };

var Form 
    = forms.Form 
    = function(params) {

    params = {
        data: {},
        files: {},
        auto_id: null,
        prefix: null,
        initial: {},
        error_class: "????",
        label_suffix: ':'
    }.merge(params || {});
    
    //find all the fields
    var fields = {};
    for (var key in this) {
        if (Object.instanceOf(this[key], fields.Field)) 
            fields[key] = this[key];
    } 
    this.fields = fields;
    
    //init instance variables
    Object.extend(this, params);

    this.is_bound = !Object.isEmpty(params.data) || !Object.isEmpty(params.files);
    this.cleaned_data = null;
    this._errors = {};
  
    
};

Form = {
    NON_FIELD_ERRORS : "__NON_FIELD_ERRORS_KEY__"
};

Form.prototype = {
    is_valid: function() {
        return this.is_bound && Object.isEmpty(this.errors);
    },
    full_clean: function() {
        this._errors = {};
        this.cleaned_data = {};
        
        if(!this.is_bound)
            return;
        
        //process all the fields
        for(var fieldKey in this.fields) {
            var field = this.fields[fieldKey];
            
            try {
                var value = field.widget.value_from_datadict(this.data, this.files, fieldKey);
            
                //TODO: special case FileField
                this.cleaned_data[fieldKey] = value;
            } catch(e if Object.instanceOf(e, ValidationError)) {
                this._errors[fName] = e.message;
            }
        }
        
        //callback
        try {
            this.cleaned_data = this.clean();
        } catch(e if Object.instanceOf(e, ValidationError)) {
            this._errors[ValidationError.NON_FIELD_ERRORS] = e.message;
        }
        
        if(!Object.isEmpty(this._errors)) {
            this.cleaned_data = null;
        }
    },
    
    clean: function() {
        return this.cleaned_data;
    },
    
    _html_output: function(normal_row, error_row, row_ender, help_text_html, errors_on_separate_row) {
        var top_errors = this.errors[Form.NON_FIELD_ERRORS];
        
        
        for(var fieldName in this.fields) {
            var field = this.fields[fieldName];
            var fieldErrors = this.errors[fieldName] || [];
            
            var data = (this.is_bound)?
                field.widget.value_from_datadict(this.data, this.files, fieldName)
                : this.initial[fieldName] || field.initial || "";

            
            //TODO: deal auto_id crap
            
            var output = "";
            var hidden_fields = ""; 
            
            if(field.is_hidden) {
                for (var i = 0; i < fieldErrors.length; i++) 
                    top_errors.push('Hidden field ' + fieldName + ') ' + fieldErrors[i]);
                hidden_fields += field.widget.render(fieldName, data, {});  //attrs? autoid?
            }
            else {
                if(errors_on_separate_row && fieldErrors.length) {
                    var fieldErrorBuff = "";
                    fieldErrorBuff += '<ul class="errorList">'
                    for(var errI = 0; errI < fieldErrors.length; errI ++ ) {
                        fieldErrorBuff += '<li>' + fieldErrors[i] + '</li>';
                    }
                    fieldErrorBuff += '</ul>';
                    output += error_row.replace("%s", fieldErrorBuff);
                } 
            }
        }
    }
};

Form.prototype.__defineGetter__("errors", function() {
    if(this._errors == null)
        this.full_clean();
    return this._errors;
});

return forms;