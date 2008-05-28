
STDERR = log.rails.error;

ActionController = {};
ActionView = {}

Rails.mangleName = function( name ){
    if ( name == "new" )
        return "__rnew";
    if ( name == "delete" )
        return "__delete";
    return name;
};

Rails.unmangleName = function( name ){
    if ( name == "__rnew" )
        return "new";
    if ( name == "__delete" )
        return "delete";
    return name;
};

__path__.utils();

__path__.lib.all();

__path__.view();
__path__.controller();
__path__.filters();

__path__.model();
__path__.migration();

__path__.viewutils();
__path__.routes();
__path__.request();
__path__.session();
__path__.mailer();
__path__.helpers();

__path__.hacks();

__path__.lib.math();

