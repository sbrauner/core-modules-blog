// wiki.js


Wiki = {

    prefixRE: null,
    outp: undefined,
    noWiki : 0,
    noHtml : 0, // normally we allow html tags within the wiki markup
    level : 0,
    inRow : false,

    // ==header==
    h: [
        { r: /^=====(.*)=====/, s: "<h5>$1</h5>" },
        { r: /^====(.*)====/, s: "<h4>$1</h4>" },
        { r: /^===(.*)===/, s: "<h3>$1</h3>" },
        { r: /^==(.*)==/, s: "<h2>$1</h2>" },
        { r: /^=(.*)=/, s: "<h1>$1</h1>" } ],

    link: [
        { r: /\[\[([^\[]+)\]\]/g , s: '<a href="$1">$1</a>' }, // [[link]]
        { r: /\[([^ \[]+\/[^ \[]+) +([^\[]+)\]/g , s: '<a href="$1">$2</a>' }, // [http://zzz name]
        { r: /\[([^\[]+\/[^\[]+)\]/g , s: '<a href="$1">$1</a>' }, // [http://zzz]
        ],

    urls: [
        //{ r: /(http:\/\/[^ ]*)/g, s: '<a href="$1">$1</a>' }, // http://link
        { r: /(^|[^\[])((http[s]?|ftp):\/\/[^ \n\t]*)(\.([ \t\n]|$))/g, s: '[$2]$4'}, // raw URL
        { r: /(^|[^\[])((http[s]?|ftp):\/\/[^ \n\t]*)([ \t\n]|$)/g, s: '[$2]$4'}, // raw URL
        ],

    basics: [
        { r: /'''([^']+)'''/g , s: "<b>$1</b>" }, // '''bold
        { r: /''([^']+)''/g , s: "<i>$1</i>" } // ''italics'
    ],

    repl: function(patts, str) {
        for( var i = 0; i < patts.length; i++ ) {
            SYSOUT(patts[i].r);
            SYSOUT(patts[i].s);
            SYSOUT(str);
            str = str.replace(patts[i].r, patts[i].s);
        }
        return str;
    },

    reLevel: function(newLevel) {
        var str = "";
        while( this.level < newLevel ) { this.level++; str = "<ul>" + str; }
        while( this.level > newLevel ) { this.level = this.level-1; str = "</ul>" + str; }
        this.outp += str;
    },

    line: function(str) {
        var trimmed = str.trim();

        var newLevel = 0;

        if( trimmed.length == 0 ) { this.outp += "<p>\n"; return; }

        if( trimmed == "</nowiki>" ) { this.noWiki = 0; return; }
        if( trimmed == "</nohtml>" ) { this.noHtml = 0; return; }
        if( trimmed == "</prenh>" ) { this.noWiki = 0; this.noHtml=0; this.outp+="</pre>\n"; return; }
        if( trimmed == "</pre>" ) { this.outp+="</pre>\n"; return; }

        if( trimmed == "<prenh>" ) {
          this.reLevel(newLevel); this.noWiki=1; this.noHtml=1; this.outp+="<pre>"; return;
        }
        if( trimmed == "<pre>" ) { this.reLevel(newLevel); this.outp+="<pre>"; return; }
        if( trimmed == "<nowiki>" ) { this.noWiki++; return; }
        if( trimmed == "<nohtml>" ) { this.noHtml++; return; }

        if( this.noHtml ) {
            str = str.replace(/</g, "&lt;");
            str = str.replace(/>/g, "&gt;");
        }

        // our simple table stuff
        if( str.match(/^[|;] /) ) {
            if( str.match( /^[|] / ) ) {
                str = str.replace( /^[|] (.*)/, "<tr><td>$1</td>" );
                if( this.inRow ) str = "</tr>" + str;
                this.inRow = true;
            }
            else {
                str = str.replace( /^; (.*)/, "<td>$1</td>" );
            }
        }
        else if( str.match( /<\/table/ ) ) {
            if( this.inRow ) {
                this.inRow = false;
                str = "</tr>" + str;
            }
        }

        if( this.noWiki>0 ) { this.reLevel(newLevel); this.outp += (str+"\n"); return; }

        // ==headers==
        if( str.match(/^=.*[^=]+=/) ) {
            str = this.repl(this.h, str);
        }

        // raw urls - disabled, see above
        str = this.repl(this.urls, str);
        SYSOUT("URLs found!");

        // links
        if( str.match(/\[/) ) {
            if( this.prefixRE )
                str = str.replace(this.prefixRE, '[[');
            str = this.repl(this.link, str);
        }

    // the basics
    str = this.repl(this.basics, str);

        // * bullets
        if( str.match(/^\*/) ) {
            var stars = "" + str.match(/^\*+/);
            stars = stars.replace( /\*/g, "u" );
            newLevel = stars.length;
            str = str.replace( /^(\*+ *)(.*)/, '">$2</li>');
            str = '<li class="' + stars + str;
        }
        this.reLevel(newLevel);

        str += '\n';
        this.outp += str;
    },

    reset: function() {
        this.prefixRE = null;
        this.outp = "";
        this.noWiki = 0;
        this.level = 0;
    },

    toHtml: function(str, prefix) {
        this.reset();
        if( prefix && prefix.length ) {
          var s = prefix.replace(/\./g, '\.');
          this.prefixRE = RegExp("\\[\\[" + s, 'g');
        }

        var ln = str.split(/\r?\n/);
        for( i = 0; i < ln.length; i++ ) {
            this.line(ln[i]);
        }
        return this.outp;
    },

    chk: function(a,b) {
        r = this.toHtml(a);
        if( r != b )
           print("CHK FAILS: " + a + "\n got " + r +
                  "\n expected: " + b);
    },

    // unit test
    test: function() {
        this.chk("=foo=", "<h1>foo</h1>\n");
        this.chk("=foo", "=foo\n");
        this.chk("[[lnk]]", '<a href="/wiki/lnk">lnk</a>\n');
        this.chk("in '''bold'''", "in <b>bold</b>\n");
        this.chk("<b>", "<b>\n");
        this.chk("<nohtml>\n<b>", "&lt;b&gt;\n");
        this.chk("*** test",
                 "<ul><ul><ul><li class=\"uuu\">test</li>\n");
    }
};


