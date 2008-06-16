function User(){

};

core.user.user();

User.config = {
    useCaptcha : false
};

User.requirements = {
    confirmed_email: [],
};

User.defaultRoot = "/~~/user";

core.core.routes();
User.routes = new Routes();
var urls = ['login', 'doLogin', 'register', 'confirm_send', 'confirm_receive',
    'checkUsername', 'captchaIMG', 'logout', 'reset_send', 'reset_receive',
    'username_send', 'fixDuplicate', 'edit'];

for(var i = 0; i < urls.length; i++){
    User.routes[urls[i]] = User.defaultRoot + '/' + urls[i];
}

User.routes.assets = new Routes();
User.routes.assets.add(/(.+)/,  '/~~/user/assets/$1');

User.findMyLocation = function(){
    if ( ! routes )
        return User.defaultRoot;

    var f = routes.find( User.routes );
    if ( ! f )
        return User.defaultRoot;

    return f;
};

User.fullLink = function(path){
    var login = User.findMyLocation();
    var link = new URL(login+path);
    link.hostname = request.getHost();
    link.port = request.getPort();
    return link;
}

User.abort = function(msg){
    addToNotice('abort', msg);
    htmlheader("Error");
    htmlfooter();
    throw Exception.Quiet(msg);
}

core.content.regexp();
