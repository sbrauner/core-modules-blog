
RAILS_ROOT = "/";

core.core.file();


function Dir(){
};

Dir.__preGet = function( path ){
    if ( ! ( path + "" ).contains( "/" ) )
        return;

    this[path] = [ "/lang/en.yaml" , "/lang/de.yaml" ];
};
