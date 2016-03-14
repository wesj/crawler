var self = require('sdk/self');
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var io = require("sdk/io/file");
var urls = require("sdk/url");
require("sdk/preferences/service").set("browser.safebrowsing.downloads.enabled", false);
var URL = urls.URL;
var { setTimeout, clearTimeout } = require("sdk/timers");

var basePath = "/Users/wesleyjohnston/crawler/";

var writeCount = 2;

function List(name) {
    this.name = name;
    this.data = readJSON(name + "Data.json") || { };
    this.indices = readJSON(name + "Indices.json") || [];
    this.pendingValues = readJSON(name + "Pending.json") || {};

    if (this.pendingCount() == 0) {
        this.addPending("http://www.google.com");
        this.addPending("http://www.bing.com");
        this.addPending("http://www.amazon.com");
        this.addPending("http://www.yahoo.com");
        this.addPending("http://www.reddit.com");
    }
}

List.prototype = {
    name: "",
    indexOf: function(key) {
        var index = this.indices.indexOf(key);
        if (index == -1) {
            this.indices.push(key);
            this.addPending(key);
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
        this.data[index] = value;
        this._count++;

        if (this._count % writeCount == 0) {
            this.write();
        }

        return index;
    },

    write: function() {
        //console.log("Write", this.name);
        writeSites(this.name + "Data.json", this.data);
        writeSites(this.name + "Indices.json", this.indices);
        writeSites(this.name + "Pending.json", this.pendingValues);
    },

    addLinkFrom: function(from, to) {
        var toVal = pages.value(to);
        var fromVal = pages.value(from);
        // console.log("Add link", to, ":", toVal, from, ":", fromVal);
        if (toVal) {
            var fromHost = fromVal.host.substring(fromVal.host.indexOf(".")+1);
            var toHost = toVal.host.substring(toVal.host.indexOf(".")+1);
            if (fromHost === toHost) addUnique(toVal.internalLinks, from);
            else addUnique(toVal.externalLinks, from);
        } else {
            toVal = pages.index(to);
            if (toVal) {
                var u = URL(toVal);
                if (!u.host) {
                    console.log("No host for", u);
                    return;
                }
                var key = u.host.substring(u.host.indexOf(".")+1);
                if (!this.pendingValues[key]) this.pendingValues[key] = {};
                if (!this.pendingValues[key][to]) this.pendingValues[key][to] = [];
                if (from) addUnique(this.pendingValues[key][to], from);
            } else {
                console.log("No to for", to);
            }
        }
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
        try {
            var i = this.indexOf(link);
            var u = URL(link);
            if (!u.host) {
                console.log("No host for", link);
                return;
            }
            var key = u.host.substring(u.host.indexOf(".")+1);
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

        if (urls.length == 0) {
            delete this.pendingValues[hosts[hostIndex]];
        }

        if (from) return { url: this.index(urlId), from: from };

        return undefined;
    }
}

var styles = {
    medias: {},
    selectors: {},
    properties:  {},
    vals: {},
    count: 0,

    increment: function(info, page, name) {
        Object.keys(info[name]).forEach(function(val) {
            if (!this[name][val]) this[name][val] = {};
            // console.log(this[name][val], name, val);
            try {
                increment(this[name][val], page, info[name][val]);
            } catch(ex) {
                console.log("Err incrementing", name, val, ex);
            }
        }, this);
    },

    addInfo: function(info, page) {
        if (info.media) {
            if (!this.medias[info.media]) { this.medias[info.media] = []; }
            this.medias[info.media].push(page);
        }

        info.urls.forEach(function(url) {
            var index = pages.indexOf(url);
            console.log("Add style");
            pages.addLinkFrom(page, index);
        });

        this.increment(info, page, "selectors");
        this.increment(info, page, "properties");
        this.increment(info, page, "vals");

        this.count++;
        // console.log("Style", this.count);
        if (this.count > writeCount) {
            this.write();
            this.count = 0;
        }
    },

    write: function() {
        writeSites("styles.json", this);
    }
}

var dom = {
    tags: {},
    attributes:  {},
    ids: {},
    classes: {},
    count: 0,

    increment: function(info, page, name) {
        Object.keys(info[name]).forEach(function(val) {
            if (!this[name][val]) this[name][val] = {};
            try {
                increment(this[name][val], page, info[name][val]);
            } catch(ex) {
                console.log("Err incrementing", name, val, ex);
            }
        }, this);
    },

    addInfo: function(info, page) {
        this.increment(info, page, "tags");
        this.increment(info, page, "attributes");
        this.increment(info, page, "ids");
        this.increment(info, page, "classes");

        this.count++;
        // console.log("DOM", this.count);
        if (this.count > writeCount) {
            this.write();
            this.count = 0;
        }
    },

    write: function() {
        writeSites("dom.json", this);
    }
}

var scripts = {
    count: 0,
    keywords: {},

    addInfo: function(info, page) {
        Object.keys(info).forEach(function(val) {
            if (!this.keywords[val]) this.keywords[val] = {};
            // console.log(this[val], val);
            try {
                increment(this.keywords[val], page, info[val]);
            } catch(ex) {
                console.log("Err incrementing", val, ex);
            }
        }, this);

        this.count++;
        // console.log("Scripts", this.count);
        if (this.count > writeCount) {
            this.write();
            this.count = 0;
        }
    },

    write: function() {
        writeSites("scripts.json", this.keywords);
    },

}

function addPage(page, from) {
    if (pages[page.url]) {
        return;
    }

    var index = undefined;
    try {
        var u = URL(page.url);
        index = pages.add(page.url, {
            scheme: u.scheme,
            host: u.host,
            path: u.path,
            port: u.port,
            hash: u.hash,
            search: u.search,
            mimeType: u.mimeType,
            anchors: page.anchors.map(function(link) { return pages.indexOf(link); }),
            links: Object.keys(page.links).map(function(link) { return pages.indexOf(page.links[link]); }),
            scripts: Object.keys(page.scripts).map(function(script) { return pages.indexOf(script); }),
            style: Object.keys(page.styles).map(function(style) { return pages.indexOf(style); }),
            headers: page.headers,
            externalLinks: [],
            internalLinks: [],
            title: page.title,
            direction: page.dir,
            images: page.images.map(function(img) { return images.indexOf(img); }),
            meta: page.meta,
            dom: page.dom.nodeCount,
            frames: page.frames.map(function(link) { return pages.indexOf(link); }),
            visitDate: Date.now(),
        });

        if (from) {
            from.forEach(function(f) {
                pages.addLinkFrom(f, index);                
            })
        }

        page.anchors.forEach(function(link) { pages.addLinkFrom(index, pages.indexOf(link)); });
        Object.keys(page.links).forEach(function(link) { pages.addLinkFrom(index, pages.indexOf(page.links[link])); });
        Object.keys(page.scripts).forEach(function(link) { pages.addLinkFrom(index, pages.indexOf(link)); });
        Object.keys(page.styles).forEach(function(link) { pages.addLinkFrom(index, pages.indexOf(link)); });
        page.images.forEach(function(link) { pages.addLinkFrom(index, pages.indexOf(link)); });

        dom.addInfo(page.dom, index);
        Object.keys(page.styles).map(function(url) {
            var index = pages.indexOf(url);
            styles.addInfo(page.styles[url], index);
        });
        Object.keys(page.scripts).map(function(url) {
            var index = pages.indexOf(url);
            scripts.addInfo(page.scripts[url], index);
        });
        words.addWords(page.words, index);
    } catch(ex) {
        console.error("Err adding page", ex, ex.filename, ex.lineNumber, page.url);
    }
    return index;
}

function increment(obj, val, amt) {
  amt = amt || 1;
  if (!obj[val]) obj[val] = 0;
  obj[val] += amt;
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
    var path = basePath + "_" + file;
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

function read(p) {
    var text = "";
    if (io.exists(p)) {
     var reader = io.open(p, "r");
     if (!reader.closed) {
      text = reader.read();
      reader.close();
  }
}
return text;
}

function write(p, data) {
    var writer = io.open(p, "w");
    if (!writer.closed) {
        writer.write(data);
        writer.close();
    } else {
        console.log("Can't write file", path, data);
    }
}

function writeSites(filename, data) {
    let p = basePath + "_" + filename;
    let old = basePath + "old_" + filename;

    write(old, read(p));
    write(p, JSON.stringify(data));
    io.remove(old);
}

var pages = new List("pages");
var images = new List("images");

var words = {
    count: 0,
    list: readJSON("words.json") || [],
    combos: readJSON("wordCombos.json") || {},

    addWords: function(combos, site) {
        Object.keys(combos).forEach(function(word) {
            var index = addUnique(this.list, word);
            if (!this.combos[index]) this.combos[index] = { s: [] };
            addUnique(this.combos[index].s, site);

            var combo = combos[word];
            combo.forEach(function(word2) {
                var j = addUnique(this.list, word2);

                if (!this.combos[index][j]) this.combos[index][j] = [];
                addUnique(this.combos[index][j], site);
            }, this);
        }, this);

        this.count++;
        // console.log("Words", this.count);
        if (this.count > writeCount) {
            this.write();
            this.count = 0;
        }
    },

    write: function() {
        writeSites("words.json", this.list);
        writeSites("wordCombos.json", this.combos);
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
          message.forEach(function(msg) {
             var index = addPage(msg, loaders[tab] ? loaders[tab].from : null);

             if (loaders[tab] && loaders[tab].url !== data.url) {
              addRedirect(loaders[tab], pages.indexOf(tab.url));
              loaders[tab] = null;
          }

                        /*
                var newPageCount = pages.count();
                if (newPageCount - pageCount > 10) {
                    writeSites("pageList.json", pages);
                    writeSites("images.json", images);
                    writeSites("words.json", words);
                    pageCount = newPageCount;
                }
                */
            });
          loadNext(tab);
      });
    });

    tab.on("error", function onError(tab) {
        pages.add(tab.url, {
            url: tab.url,
            error: true
        });

        var index = pages.add(loaders[tab].url, {
            url: tab.url,
            error: true,
            internalLinks: [],
            externalLinks: []
        });
        pages.addLinkFrom(loaders[tab].from, index);

        loadNext(tab);
    });

    loadNext(tab);
});

[0].forEach(function(url) {
    tabs.open({ url: "about:blank" })
});

function addRedirect(from, to) {
    try {
        console.log(from, to);
        var u = URL(from.url);
        index = pages.add(from.url, {
            scheme: u.scheme,
            host: u.host,
            path: u.path,
            port: u.port,
            hash: u.hash,
            search: u.search,
            mimeType: u.mimeType,
            anchors: [],
            links: [],
            scripts: [],
            style: [],
            externalLinks: [],
            internalLinks: [],
            title: "",
            direction: "",
            images: [],
            meta: [],
            dom: 0,
            redirectsTo: to,
            visitDate: Date.now(),
        });
        if (from.from) {
            from.from.forEach(function(f) {
                pages.addLinkFrom(f, index);                
            })
        }

    } catch(ex) {
        console.log("Err adding redirect", ex, from, to);
    }
}
