
log = log.content.domparser;

core.content.saxparser();

domparser = {
	fromString : function(xml) {
		var handler = {
			root: null,
			stack : [],
			startElement : function(uri, localName, name, attributes) {
				
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
					this.stack[this.stack.length - 1].elements.push(node);
				} else {
					this.root = node;
				}
				this.stack.push(node);
			},
			endElement : function(uri, localName, name) {
				this.stack.pop();
			},
			text : function(text) {
				var textOwner = this.stack[this.stack.length - 1];
				
				if(textOwner.text.length > 0)
					textOwner.textString += " " + text;
				else
					textOwner.textString = text;

				textOwner.text.push(text);
			},
			warning: function(msg) {
				log.warn(msg);
			},
			error: function(msg) {
				log.error(msg)
			},
			fatalError: function(msg) {
				log.error("FATAL: " + msg);
			}
		};
		
		
		saxparser(handler, xml);
		
		return handler.root;
	}
};
