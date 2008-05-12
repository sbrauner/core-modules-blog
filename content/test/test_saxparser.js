core.content.xml();

var cases = [
	{
		xml : "<a>aTextPart1<b>bText</b>aTextPart2</a>",
		stack: [ 
			{ event: "startDocument" },
				{ event: "startElement", uri : "", localName: "a", name: "a", attribs : [] },
					{ event: "text", text:"aTextPart1"},
					
					{ event: "startElement", uri : "", localName: "b", name: "b", attribs : [] },
						{ event: "text", text:"bText"},
					{ event: "endElement", uri: "", localName: "b", name: "b"},
					
					{ event: "text", text:"aTextPart2"},
				{ event: "endElement", uri: "", localName: "a", name: "a"},
			{ event: "endDocument" }
		]
	},
	{
		xml : "<a att1=\"val1\">aTextPart</a>",
		stack: [ 
			{ event: "startDocument" },
				{ event: "startElement", uri : "", localName: "a", name: "a", attribs : [{localName: "att1", qName: "att1", uri: "", value: "val1"}] },
					{ event: "text", text:"aTextPart"},
				{ event: "endElement", uri: "", localName: "a", name: "a"},
			{ event: "endDocument" }
		]
	},
	{
		xml : "<a xmlns:D=\"DAV:\" D:att1=\"val1\">aTextPart<D:b /></a>",
		stack: [ 
			{ event: "startDocument" },
				{ event: "startElement", uri : "", localName: "a", name: "a", attribs : [{localName: "att1", qName: "D:att1", uri: "DAV:", value: "val1"}] },
					{ event: "text", text:"aTextPart"},
					{ event: "startElement", uri : "DAV:", localName: "b", name: "D:b", attribs : [] },
					{ event: "endElement", uri: "DAV:", localName: "b", name: "D:b"},
				{ event: "endElement", uri: "", localName: "a", name: "a"},
			{ event: "endDocument" }
		]
	},
	
];
	
var TestHandler = function(eventStack){
	var i = 0;
	
	return {
		startDocument: function() {
			print("startDoc");
			assert(eventStack[i++].event == "startDocument");
		},
		endDocument: function() {
			print("endDoc");
			assert(eventStack[i++].event == "endDocument");
		},
		startElement: function(uri, localName, name, attribs) {
			print("startElement");
			
			assert(eventStack[i].event == "startElement");
			
			assert(eventStack[i].uri == uri );
			assert(eventStack[i].localName == localName);
			assert(eventStack[i].name == name);
			
			print(tojson(attribs));
			for (var j = 0; j < attribs.length; j++) {
				
				
				var attr1 = eventStack[i].attribs[j];
				var attr2 = attribs[j];
				
				assert(attr1.localName == attr2.localName );
				assert(attr1.qName == attr2.qName);
				assert(attr1.uri == attr2.uri);
				assert(attr1.value == attr2.value);
			}
			i++;
		},
		endElement: function(uri, localName, name) {
			print("endElement");
			
			assert(eventStack[i].event == "endElement");
			
			assert(eventStack[i].uri == uri );
			assert(eventStack[i].localName == localName);
			assert(eventStack[i].name == name);
			
			i++;
		},
		text: function(text) {
			assert(eventStack[i].event == "text");
			
			assert(eventStack[i].text == text);
			
			i++;
		}
	}
};

for(var i=0; i< cases.length; i++) {
	var handler = TestHandler(cases[i].stack);
	var parser = xml.parseSaxFromString(handler, cases[i].xml)
		
	print("passed case#" + i);
}


