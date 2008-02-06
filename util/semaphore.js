
Util.Semaphore = function( numPermits ){
    
    if ( ! numPermits )
        throw "need to specify number of permits";
    
    print( "numPermits : " + numPermits );
    this._sem = javaCreate( "java.util.concurrent.Semaphore" , numPermits);
};

Util.Semaphore.prototype.acquire = function(){
    this._sem.acquire();
};

Util.Semaphore.prototype.tryAcquire = function(){
    return this._sem.tryAcquire();
};

Util.Semaphore.prototype.release = function(){
    this._sem.release();
};

Util.Semaphore.prototype.availablePermits = function(){
    return this._sem.availablePermits();
};
