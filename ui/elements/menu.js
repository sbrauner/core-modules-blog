
ui.elements.Menu = function(){
    
};

ui.elements.Menu.display = function( o ){
    head.addCSS( "/@@/yui/current/base/base.css" );
    head.addCSS( "/@@/yui/current/menu/assets/skins/sam/menu.css" );

    head.addScript( "/@@/yui/current/yahoo-dom-event/yahoo-dom-event.js" );
    head.addScript( "/@@/yui/current/container/container_core.js" );
    head.addScript( "/@@/yui/current/menu/menu.js" );

    core.ui.elements.html.menuBase( o );
};

ui.elements.Menu.example = function(){
    
    var m =[
        { name : "Search Engines" , link : "/searchEngines" ,
          submenu : [
              { name : "Google" , link : "http://www.google.com/" } ,
              { name : "Yahoo!" , link : "http://www.yahoo.com/" }
          ]
        } ,

        { name : "Tech Blogs" , link : "/techBlogs" ,
          submenu : [
              { name : "Slashdot" , link : "http://slashdot.org" } ,
              { name : "Mac Rumors" , link : "http://www.macrumors.com/" }
          ] 
        } , 
        
        { name : "Foo" , link : "Bar" } , 
        
        { name : "A" , link : "B" ,
          submenu : [
              { name : "1" , link : "1" ,
                submenu : [
                    { name : "11" , link : "11" }
                ]
              } ,
              { name : "2" , link : "2" } 
          ]
        }
        
    ];
    
    ui.elements.Menu.display( m );
    
};

