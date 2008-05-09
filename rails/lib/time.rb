
class Time

  def initialize
    @date = Date.new
  end

  def self.now
    return Time.new
  end
  
  def utc
    return self
  end

  def minutes
    return @date.minute
  end

end

def testTime
  t = Time.now;
  assert( t )
  Time.now.utc-5.minutes
end

testTime
