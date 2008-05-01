admin.Jasontable = function(body, opts){
    this._body = body;
    this._opts = opts;
};

Object.extend(admin.Jasontable.prototype, {
    header: function(){
        core.admin.pieces.jasonheader(this._opts.header);
    },
    footer: function(){
        core.admin.pieces.jasonfooter(this._opts.footer);
    },
    render: function(){
        this.header();
        var ary = this._body();
        if(ary instanceof Array)
            ary.forEach(function(z){ core.admin.pieces.jasonrow(z); });

        this.footer();
    }
});