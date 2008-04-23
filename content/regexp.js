content.RegExp = {};

content.RegExp.special = ['\\', '^', '$', '.', '*', '+', '?', '=', '!', ':',
                          '|', '/', '(', ')', '[', ']', '{', '}'];

content.RegExp.escape = function(str){
    for(var i in content.RegExp.special){
        var c = content.RegExp.special[i];
        str = str.replace(new RegExp('\\' + c, 'g'), '\\' + c);
    }
    return str;
};

content.RegExp.unescape = function(str){
    for(var i in content.RegExp.special){
        var c = content.RegExp.special[i];
        str = str.replace(new RegExp('\\\\\\' + c, 'g'), c);
    }
    return str;
};

content.RegExp.literal = function(str, flags){
    return new RegExp(content.RegExp.escape(str), flags);
};