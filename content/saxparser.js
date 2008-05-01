
saxparser = function(handler, xmlString) {
	log.content.saxparser.debug("calling javaStatic");
	return javaStatic("ed.js.JSSaxParser", "getParser")(handler, xmlString);
};
