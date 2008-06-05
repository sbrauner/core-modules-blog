
module ActiveRecord 

  class Base

    def self.getCollectionName
      return name.toLowerCase();
    end

  end

end
