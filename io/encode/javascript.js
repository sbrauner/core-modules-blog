io.Encode.JavaScript = {};

io.Encode.JavaScript.escape = function(s) {
    s = s.replace(/'/g, "\\'");
    s = s.replace(/"/g, "\\\"");
    return s;
}
