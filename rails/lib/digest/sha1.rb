
module Digest
  module SHA1
    def hexdigest( s )
      STDERR.puts "don't know how to do sha1, using md5 for now"
      return ::Digest::MD5.hexdigest( s )
    end
  end
end
