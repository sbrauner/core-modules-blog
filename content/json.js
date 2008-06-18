/* JSON.isValid from YUI YAHOO.lang.JSON, code licensed under a BSD license */

var JSON = {
    /**
     * First step in the validation.  Regex used to replace all escape
     * sequences (i.e. "\\", etc) with '@' characters (a non-JSON character).
     * @property _ESCAPES
     * @type {RegExp}
     * @static
     * @private
     */
    _ESCAPES : /\\["\\\/bfnrtu]/g,
    /**
     * Second step in the validation.  Regex used to replace all simple
     * values with ']' characters.
     * @property _VALUES
     * @type {RegExp}
     * @static
     * @private
     */
    _VALUES  : /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    /**
     * Third step in the validation.  Regex used to remove all open square
     * brackets following a colon, comma, or at the beginning of the string.
     * @property _BRACKETS
     * @type {RegExp}
     * @static
     * @private
     */
    _BRACKETS : /(?:^|:|,)(?:\s*\[)+/g,
    /**
     * Final step in the validation.  Regex used to test the string left after
     * all previous replacements for invalid characters.
     * @property _INVALID
     * @type {RegExp}
     * @static
     * @private
     */
    _INVALID  : /^[\],:{}\s]*$/,
    /**
     * Four step determination whether a string is valid JSON.  In three steps,
     * escape sequences, safe values, and properly placed open square brackets
     * are replaced with placeholders or removed.  Then in the final step, the
     * result of all these replacements is checked for invalid characters.
     * @method isValid
     * @param str {String} JSON string to be tested
     * @return {boolean} is the string safe for eval?
     * @static
     */
    isValid : function (str) {
        return this._INVALID.test(str.
                replace(this._ESCAPES,'@').
                replace(this._VALUES,']').
                replace(this._BRACKETS,''));
    },


};

return JSON;