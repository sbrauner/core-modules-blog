
core.content.saxparser();

domparser = {
	fromString : function(xml) {
		
		var handler = {
			root: null,
			stack : [],
			startElement : function(uri, localName, name, attributes) {
				print("start ELm " + localName);
				
				var node = {
					localName: localName,
					qName: name,
					uri: uri,
					text: [],
					textString: null,
					attributes : {},
					elements: []
				};
				
				attributes.forEach(function(attr) {
					node.attributes[attr.qName] = attr;
				});
				
				
				if(this.stack.length > 0) {
					print("adding as child");
					this.stack[this.stack.length - 1].elements.push(node);
				} else {
					print("setting as root");
					this.root = node;
				}
				print("pusing on stack");
				this.stack.push(node);
			},
			endElement : function(uri, localName, name) {
				print("done " + localName);
				this.stack.pop();
			},
			text : function(text) {
				var textOwner = this.stack[this.stack.length - 1];
				
				if(textOwner.text.length > 0)
					textOwner.textString += " " + text;
				else
					textOwner.textString = text;

				textOwner.text.push(text);
			}
		};
		
		var parser = saxparser(handler, xml);
		
		return handler.root;
	}
};
