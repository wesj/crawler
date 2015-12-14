var self = require('sdk/self');
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var io = require("sdk/io/file");
var urls = require("sdk/url");
var URL = urls.URL;
var { setTimeout, clearTimeout } = require("sdk/timers");

function List(data) {
	data = data || { indices: null, data: null, pendingVlaues: null };
	this.indices = data.indices || [];
	this.data = data.data || {}
	this.pendingValues = data.pendingValues || {};

	if (this.pendingCount() == 0) {
		this.addPending("http://www.google.com");
		this.addPending("http://www.bing.com");
		this.addPending("http://www.amazon.com");
		this.addPending("http://www.yahoo.com");
		this.addPending("http://www.reddit.com");
	}
}

List.prototype = {
	indexOf: function(key) {
		var index = this.indices.indexOf(key);
		if (index == -1) {
			this.indices.push(key);
			return this.indices.length - 1;
		}
		return index;
	},

	index: function(i) {
		return this.indices[i];
	},

	value: function(key) {
		return this.data[key];
	},

	_count: 0,
	count: function() {
		return this._count;
	},

	add: function(key, value) {
		// console.log("Add", key, value);
		var index = this.indexOf(key);
		value._index_ = index;
		this.data[key] = value;
		this._count++;
		return index;
	},
	addLinkFrom: function(from, to) {
		addUnique(pages.value(to).linkedBy, from);
	},
	pendingCount: function() {
		var keys = Object.keys(this.pendingValues);
		var count = 0;
		keys.forEach(function(key) {
			count += this.pendingValues[key].length;
		}, this)
		return count;
	},
	addPending: function(link, from) {
		var i = this.indexOf(link);
		var u = URL(link);
		if (!u.host) {
			console.log("No host for", link);
			return;
		}
		var key = u.host.substring(u.host.indexOf(".")+1);
		try {
			if (!this.pendingValues[key]) this.pendingValues[key] = {};
			if (!this.pendingValues[key][i]) this.pendingValues[key][i] = [];
			if (from) addUnique(this.pendingValues[key][i], this.indexOf(from));
		} catch(ex) {
			console.log("Err adding pending", ex, link);
		}
	},
	getRandomPending: function() {
		var hosts = Object.keys(this.pendingValues); // ["google.com", "yahoo.com"]
		var hostIndex = Math.floor(Math.random() * hosts.length); // 0

		var urls = Object.keys(this.pendingValues[hosts[hostIndex]]); // [34, 224]
		var urlId = urls.pop(); // 224
		var from = this.pendingValues[hosts[hostIndex]][urlId];
		// console.log("Random", hosts[hostIndex], urls, urlId, from);

		if (urls.length == 0) {
			delete this.pendingValues[hosts[hostIndex]];
		}

		if (from) return { url: this.index(urlId), from: from };

		return undefined;
	}
}

function addPage(page, from) {
	if (pages[page.url]) {
		return;
	}

	try {
		var u = URL(page.url);
		// console.log("Add", page);
		return pages.add(page.url, {
			scheme: u.scheme,
			host: u.host,
			path: u.path,
			port: u.port,
			hash: u.hash,
			search: u.search,
			mimeType: u.mimeType,
			links: page.links.map(function(link) { return pages.indexOf(link); }),
			linkedBy: [from],
			title: page.title,
			direction: page.dir,
			docCharset: page.characterSet,
			metaCharset: page.metaCharset,
			description: page.description,
			contentType: page.contentType,
			images: page.images.map(function(img) { return images.indexOf(img); }),
			opengraph: page.opengraph,
			visitDate: Date.now(),
		});
	} catch(ex) {
		console.log("Err adding page", ex, ex.filename, ex.lineNumber, page.url);
	}
	return undefined;
}

function addUnique(array, val) {
	var i = array.indexOf(val);
	if (i == -1) {
		array.push(val);
		return array.length - 1;
	}
	return i;
}

function readJSON(file, d) {
	let path = "/Users/wesleyjohnston/crawler/" + file;
	var p = d;
	try {
		var reader = io.open(path, "r");
		if (!reader.closed) {
			p = reader.read();
			reader.close();
			return JSON.parse(p);
		} else {
			console.log("Can't open file", path);
		}
	} catch(ex) {
		console.log("Can't read", ex);
	}
	return p;
}

function writeSites(filename, data) {
	let path = "/Users/wesleyjohnston/crawler/" + filename;
	var writer = io.open(path, "w");
	if (!writer.closed) {
		var data = JSON.stringify(data);
		writer.write(data);
		writer.close();
	} else {
		console.log("Can't open file", path);
	}
}

var pages = new List(readJSON("pageList.json"));
var images = new List(readJSON("images.json"));
var w = readJSON("words.json");
var words = {
	list: w ? w.list : {},
	add: function(word, index) {
		try {
			if (!word) return;
			if (!this.list[word]) {
				this.list[word] = [];
			}
			this.list[word].push(index);
		} catch(ex) {
			console.log("Error adding word", ex, word, index);
		}
	}
}

function loadNext(tab) {
	if (pages.pendingCount() === 0) {
		console.log("Wait", tab.url);
		setTimeout(loadNext, 1000, tab);
	} else {
		setTimeout(function() {
			var page = pages.getRandomPending();
			if (page) {
				if (page.url.startsWith("jar") || page.url.startsWith("mailto")) {
					addPage({ url: page.url }, page.from)
					loadNext(tab);
					return;
				}
				console.log("Load", page.url, pages.count());
				loaders[tab] = page;
				tab.url = page.url;
				tab.timeout = setTimeout(function() {
					loadNext(tab);
				}, 15000);
			} else {
				loadNext(tab);
			}
		}, 500);
	}
}

var loaders = {};
var pageCount = 0;
var pendingCount = 0;

tabs.on('open', function(tab){
	tab.on('load', function onReady(tab) {
		clearTimeout(tab.timeout);

		var worker = tab.attach({
			contentScriptFile: data.url("content-script.js")
		});

		worker.port.on("html", function(message) {
			// console.log(message);
			var index = addPage(message, loaders[tab] ? loaders[tab].from : null);

			if (loaders[tab]) {
				addRedirect(loaders[tab], pages.indexOf(tab.url));
			}

			message.words.forEach(function(word) {
				words.add(word, index);
			});

			var newPageCount = pages.count();
			// console.log(newPageCount, pageCount);
			if (newPageCount - pageCount > 10) {
				writeSites("pageList.json", pages);
				writeSites("images.json", images);
				writeSites("words.json", words);
				pageCount = newPageCount;
			}

			message.links.forEach(function(link) {
				if (!pages[link]) {
					pages.addPending(link, tab.url);
				} else {
					pages.addLinkFrom(tab.url, link);
				}
			});

			// console.log(pending, pages, pageList);
			loadNext(tab);
		})
	});

	tab.on("error", function onError(tab) {
		console.log("ERR", loaders[tab], pages.pending.length);
		pages.add(tab.url, {
			url: tab.url,
			error: true
		});

		pages.add(loaders[tab].url, {
			url: tab.url,
			error: true,
			linkedBy: loaders[tab].from
		});

		loadNext(tab);
	});

	loadNext(tab);
});

[0,0,0,0,0].forEach(function(url) {
	tabs.open({ url: "about:blank" })
});

function addRedirect(from, to) {
	if (pages[from.url]) {
		return;
	}

	try {
		var u = URL(from.url);
		pages.add(from.url, {
			scheme: u.scheme,
			host: u.host,
			path: u.path,
			port: u.port,
			hash: u.hash,
			search: u.search,
			mimeType: u.mimeType,
			linkedBy: from.from,
			visitDate: Date.now(),
			redirectsTo: to,
		});
	} catch(ex) {
		console.log("Err adding redirect", ex, from, to);
	}
}
