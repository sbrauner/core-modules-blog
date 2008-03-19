function User(){

};

core.user.user();

User.config = {
    useCaptcha : false
};

User.requirements = {
    confirmed_email: [],
};


core.core.routes();
User.routes = new Routes();
var urls = ['login', 'doLogin', 'register', 'confirm_send', 'confirm_receive',
    'checkUsername', 'captchaIMG', 'logout'];
for(var i = 0; i < urls.length; i++){
    User.routes[urls[i]] = '/~~/user/'+urls[i];
}

User.findMyLocation = function(){
    if(routes && routes.find(User.routes)){
        return routes.find(User.routes);
    }
    return "/~~/user";
};
