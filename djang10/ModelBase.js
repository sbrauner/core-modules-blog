


function ModelBase() {}

ModelBase.prototype.__collection = null;

ModelBase.prototype.save = function() {
    this.__collection.save(this);
}

ModelBase.prototype.objects = {
                                    __collection : appScope[i].prototype.__collection,

                                    all : function() { return this.__collection.find(); }
};
