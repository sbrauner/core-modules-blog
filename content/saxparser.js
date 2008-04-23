
saxparser = function(handler, xmlString) {
	return javaStatic("ed.js.JSSaxParser", "getParser")(handler, xml);
};
