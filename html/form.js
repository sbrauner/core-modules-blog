/* Generate a form
Start with the most general: make a field out of a list of attributes
Most form look like:
Name: ___________
So we need something to display labels (label) and different types of input

Also, we have things like
      o Check
so we need to have things in a second column

Require field... set to false

Then we have forms in tables... we'll deal with those later
*/

html.FormBuilder = {
    stdClass = null;
    dateFormat = "";
};

html.FormBuilder = function(attr) {
    this.attr = attr;
    this.attr.method = (this.attr.method) ? this.attr.method : 'GET';
    this.htmlName = "form";
    this.children = [];
}

html.FormBuilder.prototype.render = function(f) {
    if(f == null) f = this;

    print("<"+f.htmlName);
    for(var a in f.attr) {
        html.FormBuilder.renderAttr(a, f.attr[a]);
    }
    print(">");

    for(var c in f.children) {
        if(typeof f.children[c] == "string")
            print(f.children[c]);
        else
            this.render(f.children[c]);
    }
    print("</"+f.htmlName+">");
}

// This is for the future, when val might be an array or something more complicated
html.FormBuilder.prototype.renderAttr = function(key, val) {
    print(' '+key+'="'+val+'"');
}


// Add standard form elements

// Lowest-level add to form
html.FormBuilder.prototype.add = function(htmlName, attr) {
    if(typeof attr == "string") {
        this.children.push(attr);
    }
    else {
        this.children.push({htmlName: htmlName, attr: (attr) ? attr : {}, children: []});
    }
}

html.FormBuilder.Input = {};
html.FormBuilder.addInput = function(attr) {
    var htmlName = "input";
    if(!attr)
        attr = {};
    if(!attr['type'])
        attr.type = "text";
    if(!attr["class"] && this.stdClass)
        attr["class"] = this.stdClass;

    this.add(htmlName, attr);
}