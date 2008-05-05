
module Resolv
  def getaddress( name )
    return javaStatic( "java.net.InetAddress" , "getByName" , name ).getHostAddress();
  end
end
