
module ActiveRecord 

  class Base

    def self.getSingularName
      return name.toLowerCase();
    end

    def self.getCollectionName
      return name.toLowerCase() + "s";
    end

  end

end
