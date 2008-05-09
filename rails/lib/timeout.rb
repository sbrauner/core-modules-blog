
module Timeout
  def timeout(t,&z)
    puts "warning, timeout is not really timeout yet"
    yield
  end
end
