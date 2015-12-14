function addUnique(obj, val) {
	try {
		var index = obj.indexOf(val);
		if (index == -1) {
	  		obj.push(val);
	  		index = obj.length - 1;
	  	}
	  	return index;
	} catch(ex) {
		console.log(obj, val, ex);
	}
}

function increment(obj, val, amt) {
  amt = amt || 1;
  if (!obj[val]) obj[val] = 0;
  obj[val] += amt;
}

function getAnchors() {
	var anchors = document.querySelectorAll("a");
	var res = [];
	Array.prototype.forEach.call(anchors, function(anchor) {
		var href = anchor.href;
		if (href && res.indexOf(href) == -1)
			res.push(href);
	});
	return res;
}

function getImages() {
	var images = document.images;
	var res = [];
	Array.prototype.forEach.call(images, function(image) {
		var href = image.src;
		if (res.indexOf(href) == -1)
			res.push(href);
	});
	return res;
}

function getWords() {
	var scripts = document.body.querySelectorAll("script");
	Array.prototype.forEach.call(scripts, function(script) {
	  script.parentNode.removeChild(script);
	})

	var styles = document.body.querySelectorAll("style");
	Array.prototype.forEach.call(styles, function(style) {
	  style.parentNode.removeChild(style);
	});

	var allNodes = document.body.querySelectorAll("*");
	Array.prototype.forEach.call(allNodes, function(node) {
	  var style = window.getComputedStyle(node, null);
	  var display = style.getPropertyValue("display");
	  if (display === "block" || display.startsWith("table") || display == "list-item" || display == "flex" ) {
	    node.insertAdjacentHTML("afterend", " <br/> ");
	  }
	});

	var txt = document.body.textContent;
	var sentences = txt.split(/[\.\n]+/);
	var results = {
	};

	sentences.forEach(function(sentence) {
	  	sentence = sentence.replace(/[\(\)<>,;\[\]\\\/]/g, " ");
	  	var words = sentence.split(/\s+/).filter(function(word) {
	    	return !!word;
	  	}).map(function(word) {
	    	return word.toLowerCase();
	  	});

		var prev = null;
		for (var j = 0; j < words.length; j++) {
			var word = words[j];
			if (!results[word]) results[word] = [];
			if (prev) addUnique(prev, word);
			prev = results[word];
		}
	});

  	return results;
}

function getMetaTags() {
	var results = {};
	var meta = document.querySelectorAll("meta");
	Array.prototype.forEach.call(meta, function(tag) {
		var key = tag.getAttribute("name");
		if (!key) {
			key = tag.getAttribute("property");
		}
		if (!key) {
			return;
		}

		results[key] = tag.getAttribute("content");
	});
	return results;
}

function getLinks() {
	var results = {};
	var links = document.querySelectorAll("link");
	Array.prototype.forEach.call(links, function(link) {
		var key = link.getAttribute("rel");
		if (!key) {
			return;
		}

		results[key] = link.href;
	});
	return results;
}

var scriptKeywords = [
"navigator", "userAgent", "changedTouches", "targetTouches", "slice", "call", "length", "replace", "substr",
"slice", "splice", "appendChild", "keyCode", "innerWidth", "innerHeight", "round", "sin", "cos", "tan", "asin",
"acos", "atan", "ActiveXObject", "plugins", "rand", "window", "document", "scrollingElement", 
	"abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class",
	"const", "continue", "debugger", "default", "delete", "do", "double",
	"else", "enum", "eval", "export", "extends", "false", "final", "finally", "float",
	"for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int",
	"interface", "let", "long", "native", "new", "null", "package", "private", "protected",
	"public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw",
	"throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield",
	"Array", "Date", "eval", "function", "hasOwnProperty", "Infinity", "isFinite", "isNaN",
	"isPrototypeOf", "length", "Math", "NaN", "name", "Number", "Object", "prototype", "String",
	"toString", "undefined", "valueOf",
"attributes","childElementCount","children","classList","className","clientHeight","clientLeft",
"clientTop","clientWidth","firstElementChild","id","innerHTML","lastElementChild","namespaceURI",
"nextElementSibling","outerHTML","previousElementSibling","scrollHeight","scrollLeft","scrollLeftMax","scrollTop",
"scrollTopMax","scrollWidth","shadowRoot","tabStop","tagName","undoManager","undoScope","ongotpointercapture",
"onlostpointercapture","onwheel","addEventListener","attachShadow","closest","createShadowRoot","dispatchEvent",
"find","findAll","getAnimations","getAttribute","getAttributeNS","getAttributeNode","getAttributeNodeNS",
"getBoundingClientRect","getClientRects","getDestinationInsertionPoints","getElementsByClassName","getElementsByTagName",
"getElementsByTagNameNS","hasAttribute","hasAttributeNS","hasAttributes","insertAdjacentHTML","matches","releasePointerCapture","remove","removeAttribute","removeAttributeNS","removeAttributeNode",
"removeEventListener","requestFullscreen","requestPointerLock","scrollIntoView","setAttribute","setAttributeNS",
"setAttributeNode","setAttributeNodeNS","setCapture","setPointerCapture",
	"all","async","characterSet","charset","compatMode","contentType","doctype","documentElement","documentURI",
"domConfig","hidden","implementation","inputEncoding","lastStyleSheetSet","mozSyntheticDocument",
"mozFullScreen","mozFullScreenElement","mozFullScreenEnabled","pointerLockElement","preferredStyleSheetSet",
"scrollingElement","selectedStyleSheetSet","styleSheets","styleSheetSets","timeline","undoManager","URL",
"visibilityState","xmlEncoding","xmlStandalone","xmlVersion","children","firstElementChild","lastElementChild",
"childElementCount","activeElement","alinkColor","anchors","applets","bgColor","body","cookie","defaultView",
"designMode","dir","domain","embeds","fgColor","forms","head","height","images","lastModified","linkColor",
"links","location","plugins","readyState","referrer","scripts","title","URL","vlinkColor","width","onabort",
"onafterscriptexecute","onbeforescriptexecute","onblur","oncancel","oncanplay","oncanplaythrough","onchange",
"onclick","onclose","oncontextmenu","oncopy","oncuechange","oncut","ondblclick","ondrag","ondragend","ondragenter",
"ondragexit","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror",
"onfocus","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata",
"onloadstart","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup",
"onmousewheel","onmozfullscreenchange","onmozfullscreenerror","onpause","onpaste","onplay","onplaying","onpointerdown",
"onpointerlockchange","onpointerlockerror","onpointermove","onpointerup","onpointercancel","onpointerover","onpointerout",
"onpointerenter","onpointerleave","onpointerlockchange","onpointerlockerror","onprogress","onratechange","onreadystatechange",
"onreset","onscroll","onseeked","onseeking","onselect","onselectstart","onselectionchange","onshow","onsort","onstalled",
"onsubmit","onsuspend","ontimeupdate","onvolumechange","onwaiting","onwheel","adoptNode","captureEvents","caretPositionFromPoint",
"caretRangeFromPoint","createAttribute","createAttributeNS","createCDATASection","createComment","createDocumentFragment",
"createElement","createElementNS","createEntityReference","createEvent","createNodeIterator","createProcessingInstruction","createRange","createTextNode","createTouch","createTouchList","createTreeWalker","elementFromPoint","elementsFromPoint",
"enableStyleSheetsForSet","exitPointerLock",
"importNode","normalizeDocument","registerElement","releaseCapture","releaseEvents","routeEvent","mozSetImageElement",
"getElementById","querySelector","querySelectorAll","createExpression","createNSResolver","evaluate","clear",
"close","execCommand","getElementsByName","getSelection","hasFocus","open","queryCommandEnabled","queryCommandIndeterm",
"queryCommandState","queryCommandSupported","queryCommandValue","write","writeln"
]

var ops = "[\/*\s+\(\.\-]"
function getScriptInfo() {
	var scripts = document.scripts;
	var results = {};
	Array.prototype.forEach.call(scripts, function(script) {
		var url = script.url || document.location.href;
		getScriptDetails(url, script.textContent, results)
	});
	return results;
}

function getScriptDetails(url, text, results) {
	results = results || {};
	if (!results[url]) results[url] = {}

	if (!text) {
		return results;
	}

	scriptKeywords.forEach(function(keyword) {
		var regex = new RegExp(ops + keyword + ops, "g");
		var matches = text.match(regex);
		if(matches && matches.length > 0) {
			increment(results[url], "_" + keyword, matches.length);
		}
	});

	return results;
}

function getDOMInfo() {
  var nodes = document.querySelectorAll("*");
  var result = {
  	nodeCount: nodes.length,
    tags: {},
    attributes: {},
    ids: {},
    classes: {}
  };
  Array.prototype.forEach.call(nodes, function(node) {
    var name = node.nodeName.toLowerCase();
    if (name == "input") {
      increment(result.tags, name + "_" + node.getAttribute("type"));
    } else {
      increment(result.tags, name);
    }

    Array.prototype.forEach.call(node.attributes, function(attr) {
      increment(result.attributes, attr.name);
    });
    increment(result.ids, node.id);
    
    if (node.hasAttribute("class")) {
      var classes = node.getAttribute("class").split(/\W+/);
      Array.prototype.forEach.call(classes, function(cls) {
        increment(result.classes, cls);
      });
    }
  });
  return result;
}

var cssSelectors = {
	"#": "id",
	"\\.": "class",
	"\\*": "all",
	",": "multi",
	">": "parent",
	"\\+": "sibling",
	"~(?!=)": "preceding",
	"\\[": "attribute",
	"~(?=\\=)": "attribute contains",
	"\\|(?=\\=)": "attribute starts with",
	"^(?=\\=)": "attribute starts with alt",
	"$(?=\\=)": "attribute end with",
	"\\*(?=\\=)": "attribute contains alt",
	":active": "active",
	":enabled": "enabled",
	":before": "before",
	":disabled": "disabled",
	":checked": "checked",
	":empty": "empty",
	":first-child": "first-child",
	":first-letter": "first-letter",
	":first-line": "first-line",
	":first-of-type": "first-of-type",
	":focus": "focus",
	":hover": "hover",
	":in-range": "in-range",
	":invalid": "invalid",
	":lang": "lang",
	":last-child": "last-child",
	":last-of-type": "last-of-type",
	":link": "link",
	":not\\(": "not",
	":nth-child\\(": "nth-child",
	":nth-last-child\\(": "nth-last-child",
	":only-of-type": "only-of-type",
	":only-child": "only-child",
	":optional": "optional",
	":out-of-range": "out-of-range",
	":read-only": "read-only",
	":read-write": "read-write",
	":required": "required",
	":root": "root",
	":selection": "selection",
	":target": "target",
	":valid": "valid",
	":visited": "visited",
};

var cssValues = {
	"(?:url\\()[^\\)]+(?:\\))": "url",
	"rgba\\(": "rgba",
	"rgb\\(": "rgb",
	"hsla\\(": "hsla",
	"hsl\\(": "hsl",
	"#": "hexColor",
	",": "multi",
	"px": "px",
	"pt": "pt",
	"pc": "pc",
	"em": "em",
	"vw": "vw",
	"vh": "vh",
	"cm": "cm",
	"mm": "mm",
	"in": "in",
	"[0-9]s[;\\s]": "seconds",
	"ch": "ch",
	"rem": "rem",
	"vmin": "vmin",
	"vmax": "vmax",
	"%": "percent",
	"attr\\(": "attr",
		"normal": "normal",
		"italic": "italic",
		"oblique": "oblique",
		"bold": "bold",
		"small-caps": "small-caps",
		"inherit": "inherit",
		"initial": "initial",
	"calc\\(": "calc",
	"linear-gradient\\(": "linear-gradient",
	"radial-gradient\\(": "radial-gradient",
	"repeating-linear-gradient\\(": "repeating-linear-gradient",
	"repeating-radial-gradient\\(": "repeating-radial-gradient",
	"Courier": "Courier",
	"Monaco": "Monaco",
	"Verdana": "Verdana",
	"Geneva": "Geneva",
	"Helvetica": "Helvetica",
	"sans-serif": "sans-serif",
	"Tahoma": "Tahoma",
	"Impact": "Impact",
	"Charcoal": "Charcoal",
	"[^sans-]serif": "serif",
	"cursive": "cursive",
	"Gadget": "Gadget",
	"Arial": "Arial",
	"monospace": "monospace",
	"AliceBlue": "AliceBlue",
	"AntiqueWhite": "AntiqueWhite",
	"Aqua": "Aqua",
	"Aquamarine": "Aquamarine",
	"Azure": "Azure",
	"Beige": "Beige",
	"Bisque": "Bisque",
	"Black": "Black",
	"BlanchedAlmond": "BlanchedAlmond",
	"Blue": "Blue",
	"BlueViolet": "BlueViolet",
	"Brown": "Brown",
	"BurlyWood": "BurlyWood",
	"CadetBlue": "CadetBlue",
	"Chartreuse": "Chartreuse",
	"Chocolate": "Chocolate",
	"Coral": "Coral",
	"CornflowerBlue": "CornflowerBlue",
	"Cornsilk": "Cornsilk",
	"Crimson": "Crimson",
	"Cyan": "Cyan",
	"DarkBlue": "DarkBlue",
	"DarkCyan": "DarkCyan",
	"DarkGoldenRod": "DarkGoldenRod",
	"DarkGray": "DarkGray",
	"DarkGreen": "DarkGreen",
	"DarkKhaki": "DarkKhaki",
	"DarkMagenta": "DarkMagenta",
	"DarkOliveGreen": "DarkOliveGreen",
	"DarkOrange": "DarkOrange",
	"DarkOrchid": "DarkOrchid",
	"DarkRed": "DarkRed",
	"DarkSalmon": "DarkSalmon",
	"DarkSeaGreen": "DarkSeaGreen",
	"DarkSlateBlue": "DarkSlateBlue",
	"DarkSlateGray": "DarkSlateGray",
	"DarkTurquoise": "DarkTurquoise",
	"DarkViolet": "DarkViolet",
	"DeepPink": "DeepPink",
	"DeepSkyBlue": "DeepSkyBlue",
	"DimGray": "DimGray",
	"DodgerBlue": "DodgerBlue",
	"FireBrick": "FireBrick",
	"FloralWhite": "FloralWhite",
	"ForestGreen": "ForestGreen",
	"Fuchsia": "Fuchsia",
	"Gainsboro": "Gainsboro",
	"GhostWhite": "GhostWhite",
	"Gold": "Gold",
	"GoldenRod": "GoldenRod",
	"Gray": "Gray",
	"Green": "Green",
	"GreenYellow": "GreenYellow",
	"HoneyDew": "HoneyDew",
	"HotPink": "HotPink",
	"IndianRed": "IndianRed",
	"Indigo": "Indigo",
	"Ivory": "Ivory",
	"Khaki": "Khaki",
	"Lavender": "Lavender",
	"LavenderBlush": "LavenderBlush",
	"LawnGreen": "LawnGreen",
	"LemonChiffon": "LemonChiffon",
	"LightBlue": "LightBlue",
	"LightCoral": "LightCoral",
	"LightCyan": "LightCyan",
	"LightGoldenRodYellow": "LightGoldenRodYellow",
	"LightGray": "LightGray",
	"LightGreen": "LightGreen",
	"LightPink": "LightPink",
	"LightSalmon": "LightSalmon",
	"LightSeaGreen": "LightSeaGreen",
	"LightSkyBlue": "LightSkyBlue",
	"LightSlateGray": "LightSlateGray",
	"LightSteelBlue": "LightSteelBlue",
	"LightYellow": "LightYellow",
	"Lime": "Lime",
	"LimeGreen": "LimeGreen",
	"Linen": "Linen",
	"Magenta": "Magenta",
	"Maroon": "Maroon",
	"MediumAquaMarine": "MediumAquaMarine",
	"MediumBlue": "MediumBlue",
	"MediumOrchid": "MediumOrchid",
	"MediumPurple": "MediumPurple",
	"MediumSeaGreen": "MediumSeaGreen",
	"MediumSlateBlue": "MediumSlateBlue",
	"MediumSpringGreen": "MediumSpringGreen",
	"MediumTurquoise": "MediumTurquoise",
	"MediumVioletRed": "MediumVioletRed",
	"MidnightBlue": "MidnightBlue",
	"MintCream": "MintCream",
	"MistyRose": "MistyRose",
	"Moccasin": "Moccasin",
	"NavajoWhite": "NavajoWhite",
	"Navy": "Navy",
	"OldLace": "OldLace",
	"Olive": "Olive",
	"OliveDrab": "OliveDrab",
	"Orange": "Orange",
	"OrangeRed": "OrangeRed",
	"Orchid": "Orchid",
	"PaleGoldenRod": "PaleGoldenRod",
	"PaleGreen": "PaleGreen",
	"PaleTurquoise": "PaleTurquoise",
	"PaleVioletRed": "PaleVioletRed",
	"PapayaWhip": "PapayaWhip",
	"PeachPuff": "PeachPuff",
	"Peru": "Peru",
	"Pink": "Pink",
	"Plum": "Plum",
	"PowderBlue": "PowderBlue",
	"Purple": "Purple",
	"RebeccaPurple": "RebeccaPurple",
	"Red": "Red",
	"RosyBrown": "RosyBrown",
	"RoyalBlue": "RoyalBlue",
	"SaddleBrown": "SaddleBrown",
	"Salmon": "Salmon",
	"SandyBrown": "SandyBrown",
	"SeaGreen": "SeaGreen",
	"SeaShell": "SeaShell",
	"Sienna": "Sienna",
	"Silver": "Silver",
	"SkyBlue": "SkyBlue",
	"SlateBlue": "SlateBlue",
	"SlateGray": "SlateGray",
	"Snow": "Snow",
	"SpringGreen": "SpringGreen",
	"SteelBlue": "SteelBlue",
	"Tan": "Tan",
	"Teal": "Teal",
	"Thistle": "Thistle",
	"Tomato": "Tomato",
	"outside": "outside",
	"none": "none",
	"flex": "flex",
	"solid": "solid",
	"dashed": "dashed",
	"absolute": "absolute",
	"static": "static",
	"inline[^\-]": "inline",
	"inline-block": "inline-block",
	"Turquoise": "Turquoise",
	"Violet": "Violet",
	"Wheat": "Wheat",
	"White": "White",
	"WhiteSmoke": "WhiteSmoke",
	"Yellow": "Yellow",
	"YellowGreen": "YellowGreen",
}

function getStyleInfo() {
	var sheets = document.styleSheets;
	var results = { };
	Array.prototype.forEach.call(sheets, function(sheet) {
		var url = sheet.href || document.location.href;
		if (!results[url]) results[url] = {
			media: "",
			selectors:  {},
			properties: {},
			vals: {},
			urls: [],
		};

		try {
			var rules = sheet.cssRules;
			var res = results[url];
			Array.prototype.forEach.call(rules, function(rule) {
				var split = rule.cssText.split("{");
				if (split.length == 2) {
					Object.keys(cssSelectors).forEach(function(selector) {
						var regex = new RegExp(selector, "ig");
						var result = split[0].match(regex);
						if (result) {
							increment(res.selectors, cssSelectors[selector], result.length);
						}
					});

					var props = split[1].split(";");
					props.forEach(function(property) {
						var set = property.split(":");
						if (set.length == 2) {
							increment(res.properties, set[0]);
							Object.keys(cssValues).forEach(function(value) {
								var regex = new RegExp(value, "ig");
								var r = set[1].match(regex);
								if (r) {
									increment(res.vals, cssValues[value], r.length);
									if (cssValues[value] == "url") {
										res.urls.push(r.substring(4, r.length-1));
									}
								}
							});
						} else {
							// console.log("Set", set);
						}
					});
				}
			});
			res.media = sheet.media;

		} catch(ex) {
			// console.log("Can't load sheet", ex);
		}
	});
	return results;
}

if (document.contentType == "text/css") {
	var style = document.createElement("style");
	style.setAttribute("type", document.contentType);
	style.textContent = document.body.textContent;
	document.head.appendChild(style);
	self.port.emit("html", {
		url: document.location.href,
		title: "",
		direction: "",
		docCharset: document.characterSet,
		anchors: [],
		images: [],
		meta: {},
		links: {},
		dom: {
			nodeCount: 0,
			tags: {},
			attributes: {},
			ids: {},
			classes: {}
		},
		styles: getStyleInfo(),
		scripts: {},
		words: {},
	});
} else if (document.contentType == "text/javascript") {
	self.port.emit("html", {
		url: document.location.href,
		title: "",
		direction: "",
		docCharset: document.characterSet,
		anchors: [],
		images: [],
		meta: {},
		links: {},
		dom: {
			nodeCount: 0,
			tags: {},
			attributes: {},
			ids: {},
			classes: {}
		},
		styles: {},
		scripts: getScriptDetails(document.location.href, document.body.textContent),
		words: {},
	});
} else {
	self.port.emit("html", {
		url: document.location.href,
		title: document.title,
		direction: document.dir,
		docCharset: document.characterSet,
		anchors: getAnchors(),
		images: getImages(),
		meta: getMetaTags(),
		links: getLinks(),
		dom: getDOMInfo(),
		styles: getStyleInfo(),
		scripts: getScriptInfo(),
		words: getWords(),
	});
}