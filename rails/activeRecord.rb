
module ActiveRecord 

  class Base
    
    def initialize(old)

      if ( old )
        extend( old );
      end
      
      if ( @_beforeCreate)
        send( @_beforeCreate );
      end

    end

    def self.getSingularName
      return @_className.toLowerCase();
    end

    def self.getCollectionName
      return @_className.toLowerCase() + "s";
    end
    
    # callback setups
    def self.before_create( funcName )
      self._beforeCreate = funcName;
    end

  end

end
