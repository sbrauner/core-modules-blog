/* translate wiki markup to html 
   see http://www.10gen.com/wiki/wiki.markup

   todo: move this file to /app/wiki/ folder?

   options:
     set app.wiki.programmer=false to disable "programmer" extensions to the wiki; for example the 
       programmer extensions auto-link "core.module();" statements in the wiki.
*/

content.WikiParser = function(device, resultopts) {
    this.texdevice = { 

	header: function(title) { 
	    if( resultopts.stitching ) return '% next wiki document ' + resultopts.stitching + '\n';
	    print("TITLE:" + title + ":\n");
	    return "\\documentclass[12pt]{article}\n" + 
	    "\\usepackage{graphicx}\n" + 
	    "\\usepackage{listings,color}\n" +
	    "\\lstloadlanguages{Java}\n" + 
    //	    "\\lstset{language=Java,showstringspaces=false,breaklines=true}\n" +
	    "\\lstset{language=Java,showstringspaces=false,breaklines=true,basicstyle=\\ttfamily\\small}\n" +

	    "\\title{" + 
	        	    (title.replace(/_/g,'\\_') || "no title") +
	    "}\n\\date{}\n\\begin{document}\n\\maketitle\n"; 
	},

	code: 
	/*function(a,b,c) {
	    print("a:" + a + " b:" + b + " c:" + c + '\n');
	    return "\\texttt{TEMP}";
	},*/
	"\\texttt{$1}",

	h: [
	    "\\part{$1}",
	    "\\section{$1}",
	    "\\subsection{$1}",
	    "\\subsubsection{$1}",
	    "\\subsubsection{$1}"
	    ],

	p: "\n\n",

	// links (a=anchor)
        a1:'$2',
        a2:'$1',
        a3:'$2',
        a4:'$1',
	fwd1:function(s,a,b){
	    if( resultopts ) resultopts.stitch = a;
	    return '';
	},
	fwd2:function(s,a){
	    if( resultopts ) 
		resultopts.stitchopts = a;
	    return '';
	},
	bwd1:'', bwd2:'',

        bold: "\\textbf{$1}",
	italics: "\\emph{$1}",

	ul: "\\begin{itemize}", _ul: "\\end{itemize}\n",
	li: '\\item $2',

	//pre: "\\begin{verbatim}\n", _pre: "\\end{verbatim}\n",
	pre: "\\begin{lstlisting}\n", _pre: "\\end{lstlisting}\n",

	colAligns: { c: "", done: false },
	tr: "$1",
	_tr: function() { this.colAligns.done = true; return "\\\\\n "; },
	td: function() { if( !this.colAligns.done ) this.colAligns.c += "l "; return " & $1"; },
	_table: function(wikiobj) { 
	    //print("\n\n_TABLE " + this.colAligns.c + "\n\n");
	    wikiobj.outp = wikiobj.outp.replace(/~~~~~42/, this.colAligns.c);
	},

	fileTag: function(wikiobj,fileobj) 
	{ 
	    // epstopdf myfig.eps
	    var fpath = "tmp/" + fileobj.filename;
	    fileobj.writeToLocalFile(fpath);
	    return '\\includegraphics[width=0.8\\textwidth]{' + fpath + '}\n';
	},

	footer: function() { 
	    return resultopts.stitch ? '\n' : "\\end{document}\n"; 
	}, 

	escape: function(s) {
	    // html tags:
	    var old = s;
	    s = s.replace(/<table[^>]*>/g, "\n\n\\begin{tabular}{ ~~~~~42}\n");
	    if( s != old ) {
		this.colAligns.c = "l ";
		this.colAligns.done = false;
		// don't escape our backslashes just added. 
		// if it turns out there might be other stuff that needs escaping on the 
		// same line, you might want to put a special marker in now and replace them 
		// at the end of this function.
		return s;
	    }
	    s = s.replace(/<\/table[^>]*>/g, "\\end{tabular}\n");
	    if( s != old ) return s;
	    s = s.replace(/<[^>]+>/g, "");

	    s = s.replace(/_/g, "\\_");
	    s = s.replace(/&/g, "\\&");
	    s = s.replace(/\\$/g, "\\$");
	    s = s.replace(/%/g, "\\%");
//	    s = s.replace(/\[/g, "\\[");
	    s = s.replace(/\{/g, "\\{");
	    s = s.replace(/\}/g, "\\}");
	    s = s.replace(/#/g, "\\#");
	    s = s.replace(/\^/g, "\\^");
	    s = s.replace(/~/g, "\\~");
	    s = s.replace(/</g, "\\textless ");
	    s = s.replace(/>/g, "\\textgreater ");
//	    s = s.replace(/\[/g, "B");

	    return s;
	},

	lt: "\\textless ",
	gt: "\\textgreater ",

	programmer: []

    };

    this.htmldevice = { 

	header: function() { return ""; },

	code: "<code>$1</code>",

	h: [
	    "<h1>$1</h1>",
	    "<h2>$1</h2>",
	    "<h3>$1</h3>",
	    "<h4>$1</h4>",
	    "<h5>$1</h5>"],

	tr: "<tr><td>$1</td>",
	_tr: function() { return "</tr>"; },
	td: function() { return "<td>$1</td>"; },
	_table: function(wikiobj) { },

	// /~~/f?id=4852c3b3796c7a2e00fa2526&maxY=160&maxX=300
	fileTag: function(wikiobj,fileobj) 
	{
	    return '<img src="/~~/f?id=' + fileobj._id + '">';
	},

	p: "<p>\n",

        a1:'<a href="$1">$2</a>',  // [[wikipagename|description]]
        a2:'<a href="$1">$1</a>',  // [[wikipagename]]

        //a3:'<a href="$1">$2</a>',  // [http://foo description]
	a3: function(m,link,desc) { 
	    return "<a " + 
	    (link.indexOf("10gen") < 0 ? 'class="external-link" ' : '') +
	    'href="' + link + '">' + desc + '</a>';
	},

        //a4:'<a href="$1">$1</a>',  // [http://foo]
	a4: function(m,link) { 
	    return "<a " + 
	    (link.indexOf("10gen") < 0 ? 'class="external-link" ' : '') +
	    'href="' + link + '">' + link + '</a>';
	},

        fwd1:'Next: <a href="$1">$2</a>',
        fwd2:'Next: <a href="$1">$1</a>',
        bwd1:'Prev: <a href="$1">$2</a>',
        bwd2:'Prev: <a href="$1">$1</a>',

        bold: "<strong>$1</strong>",
	italics: "<em>$1</em>",

	ul: "<ul>", _ul: "</ul>",
	li: '<li class="u">$2</li>',

	pre: "<pre>", _pre: "</pre>",

	footer: function() { return ""; },

	lt: "&lt;",
	gt: "&gt;",

	escape: function(s) { return s; },

	// wiki extensions helpful for development
	// the first rule here automatically marks up a core.foo() tag to link to 
	// the associated corejs.10gen.com/admin/doc page.
	programmer : [ 
                      { r: /^([^\[]*)core\.([a-zA-Z0-9_.]+)\(\)/g, 
			s: function(a,b,c) { 
			      return b + '<a href="http://corejs.10gen.com/admin/doc?f=/' +
			      c.replace(/[.]/, "/") + '">' + "core." + c + '()</a>';
			  }
		      }
		       ]

    };

    this.d /*"device"*/ = device == "tex" ? this.texdevice : this.htmldevice;

    this.prefixRE = null;
    this.outp = undefined;
    this.noWiki = 0;
    this.preMode = 0; // in a <pre> block
    this.noHtml = 0; // normally we allow html tags within the wiki markup
    this.level = 0;
    this.inRow = false;

    // ==header==
    this.h = [
        { r: /^=====\s*(.*)\s*=====/, s: this.d.h[4] },
        { r: /^====\s*(.*)\s*====/, s: this.d.h[3] },
        { r: /^===\s*(.*)\s*===/, s: this.d.h[2] },
        { r: /^==\s*(.*)\s*==/, s: this.d.h[1] },
        { r: /^=\s*(.*)\s*=/, s: this.d.h[0] } ];

    // [[links]]
    this.link = [
        { r: /\[\[([^|\[]+)\|([^\[]+)\]\]/g , s: this.d.a1 }, // [[link|pretty text]]
        { r: /\[\[([^\[]+)\]\]/g , s: this.d.a2 }, // [[link]]

	// forward chapter links [[fwd}}
	// pdf mode uses these to chain together pages
	// \\? is because of tex pre-escaping brace
        { r: /\[\[(.+?)\|(.+?)\\?\}\\?\}/g , s: this.d.fwd1 }, // [[link|pretty text}}
	//        { r: /\[\[([^|\[]+)\|([^\[]+)\\?\}\\?\}/g , s: this.d.fwd1 }, // [[link|pretty text}}
        { r: /\[\[(.+?)\\?\}\\?\}/g , s: this.d.fwd2 }, // [[link}}

	// backward chapter links [[fwd}}
	// pdf mode doesn't display as it assumes everything is stiched together
	{ r: /\\?\{\\?\{([^|\[]+)\|([^\[]+)\]\]/g , s: this.d.bwd1 }, // [[link|pretty text}}
	{ r: /\\?\{\\?\{([^\[]+)\]\]/g , s: this.d.bwd2 }, // [[link}}

        // FIXME: this following regexp doesn't eat trailing spaces, because
        // the name part matches "anything which isn't a bracket"; probably
        // this is correct, because a name-part can have spaces in it.
        { r: /\[\s*([^ \[]+\/[^ \[]+) +([^\[]+)\s*\]/g , s: this.d.a3 }, // [http://zzz name]

        // If there was anything after trailing space, it would match the above
        // regexp, so match up to "anything which isn't a space or a bracket".
        { r: /\[\s*([^\[]+\/[^ \[]+)\s*\]/g , s: this.d.a4 }, // [http://zzz]
        ];

    this.urls = [
        //{ r: /(http:\/\/[^ ]*)/g, s: '<a href="$1">$1</a>' }, // http://link
        { r: /((^|\w|\])\s*)((http[s]?|ftp):\/\/[^ \n\t]*)(\.([ \t\n]|$))/g, s: '$1[$3]$5'}, // raw URL
        { r: /((^|\w|\])\s*)((http[s]?|ftp):\/\/[^ \n\t]*)([ \t\n]|$)/g, s: '$1[$3]$5'}, // raw URL
        ];

    this.basics = [
        { r: /\\?%([^%\\]+)\\?%/g, s: this.d.code },
        { r: /'''(.+?)'''/g , s: this.d.bold }, // '''bold'''
        { r: /''(.+?)''/g , s: this.d.italics }, // ''italics''
    ];

};

content.WikiParser._repl = function(patts, str) {
    for( var i = 0; i < patts.length; i++ ) {
        str = str.replace(patts[i].r, patts[i].s);
    }
    return str;
};

/* reset our indentation level (for bullets) as appropriate
 */
content.WikiParser.prototype._reLevel = function(newLevel) {
    var str = "";
    while ( this.level < newLevel ) {
        this.level++;
        str = this.d.ul + str;
    }

    while ( this.level > newLevel ) {
        this.level = this.level-1;
        str = this.d._ul + str;
    }

    this.outp += str;
};

/* process a wiki line of wiki content.
   str - the line
*/
content.WikiParser.prototype._line = function(str) {
    var trimmed = str.trim();
    var newLevel = 0;

    if( trimmed.length == 0 ) { 
	if( !this.lastWasHdr )
	    this.outp += this.preMode ? '\n' : this.d.p; 
	return; 
    }

    this.lastWasHdr = null;

    /* <file id="name"> must be on a line by itself, for now */
    if( trimmed.startsWith("<file ") ) { 
	var m = trimmed.match(/name="(.*)"/);
	if( m && m.length >= 2 ) { 
	    var fn = m[1];
	    var file = db._files.findOne({filename:fn});
	    if( file ) {
		this.outp += this.d.fileTag(this, file);
	    }
	    else 
		this.outp += "?";
	}
	return;
    }

    if( trimmed == "</nowiki>" ) { this.noWiki = 0; return; }
    if( trimmed == "</nohtml>" ) { this.noHtml = 0; return; }
    if( trimmed == "</prenh>" ) { this.noWiki = 0; this.noHtml=0; this.outp+=this.d._pre; this.preMode = 0; return; }
    if( trimmed == "</pre>" ) { this.outp+=this.d._pre; this.preMode = 0; return; }
    if( trimmed == "<prenh>" ) {
        this._reLevel(newLevel); this.noWiki=1; this.noHtml=1; this.outp += this.d.pre; this.preMode = 1; return;
    }
    if( trimmed == "<pre>" ) { this._reLevel(newLevel); this.outp += this.d.pre; this.preMode = 1; return; }
    if( trimmed == "<nowiki>" ) { this.noWiki++; return; }
    if( trimmed == "<nohtml>" ) { this.noHtml++; return; }

    if( this.preMode && this.d != this.htmldevice ) { 
	this.outp += str + '\n'; 
	return; 
    }

    if( this.noHtml ) {
        str = str.replace(/</g, this.d.lt);
        str = str.replace(/>/g, this.d.gt);
    }

    var tableClose = str.match( /<\/table/ );
    str = this.d.escape(str);

    // our simple table stuff
    if ( str.match(/^[|;] /) ) {
        if( str.match( /^[|] / ) ) {
            str = str.replace( /^[|] (.*)/, this.d.tr );
            if( this.inRow ) str = this.d._tr() + str;
            this.inRow = true;
        } else {
            str = str.replace( /^; (.*)/, this.d.td() );
        }
    } else if( tableClose ) {
        if( this.inRow ) {
            this.inRow = false;
            str = this.d._tr() + str;
        }
	this.d._table(this);
    }

    if( this.noWiki>0 ) { this._reLevel(newLevel); this.outp += (str+"\n"); return; }

    // ==headers==
    if( str.match(/^=.*[^=]+=/) ) {
	var old = str;
        str = content.WikiParser._repl(this.h, str);
	this.lastWasHdr = str != old;
    }

    // raw urls - disabled, see above
    str = content.WikiParser._repl(this.urls, str);

    if( str.match(/core/) && app.wiki && (app.wiki.programmer==null || !app.wiki.programmer) ) {
	var old = str;
	str = content.WikiParser._repl(this.d.programmer, str);
    }

    // links
    if( str.match(/\[/) || str.match(/\]/) ) {
        if( this.prefixRE ) { 
	    str = str.replace(this.prefixRE, '[[');
	}
        str = content.WikiParser._repl(this.link, str);
    }

    // the basics
    str = content.WikiParser._repl(this.basics, str);

    // * bullets
    if( str.match(/^\*/) ) {
        var stars = "" + str.match(/^\*+/);
	//stars = stars.replace( /\*/g, "u" );
        newLevel = stars.length;
        str = str.replace( /^(\*+ *)(.*)/, this.d.li );
    }

    this._reLevel(newLevel);

    str += '\n';
    this.outp += str;
};

content.WikiParser.prototype._reset = function() {
    this.prefixRE = null;
    this.outp = "";
    this.noWiki = 0;
    this.noHtml = 0;
    this.preMode = 0;
    this.level = 0;
};

content.WikiParser.prototype.toHtml = function(str, prefix, title) {
    lastPrefix = { last: prefix };

    this._reset();
    if( prefix && prefix.length ) {
        var s = prefix.replace(/\./g, '\.');
        this.prefixRE = RegExp("\\[\\[" + s, 'g');
	log.wiki.error("prefix2:re:" + this.prefixRE);
    }

    var ln = str.split(/\r?\n/);
    for( var i = 0; i < ln.length; i++ ) {
        this._line(ln[i]);
    }
    this._reLevel(0);  // closes out </ul>'s.

    return this.d.header(title) + this.outp + this.d.footer();
};

content.WikiParser._chk = function(a,b) {
    var wikiParser = new content.WikiParser();
    r = wikiParser.toHtml(a);
    if( r != b )
    print("CHK FAILS: " + a + "\n got " + r + "\n expected: " + b);
};

// unit test
content.WikiParser.test = function() {
    content.WikiParser._chk("=foo=", "<h1>foo</h1>\n");
    content.WikiParser._chk("=foo", "=foo\n");
    content.WikiParser._chk("[[lnk]]", '<a href="lnk">lnk</a>\n');
    content.WikiParser._chk("in '''bold'''", "in <b>bold</b>\n");
    content.WikiParser._chk("<b>", "<b>\n");
    content.WikiParser._chk("<nohtml>\n<b>", "&lt;b&gt;\n");
    content.WikiParser._chk("*** test", "<ul><ul><ul><li class=\"u\">test</li>\n");
    print("---------\nTest Done\n");
};
