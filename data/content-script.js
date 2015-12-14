
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

	function addUnique(array, elt) {
	  if (array.indexOf(elt) == -1) {
	    array.push(elt);
	  }
	}

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
	var results = [];
	sentences.forEach(function(sentence) {
	  sentence = sentence.replace(/[\(\)<>,;\[\]\\\/]/g, " ");
	  var words = sentence.split(/\s+/).filter(function(word) {
	    return !!word;
	  }).map(function(word) {
	    return word.toLowerCase();
	  });
	  
	  var combos = [];
	  for (var i = 0; i < words.length; i++) {
	    for (var j = 0; j < 3; j++) {
	      if (i >= j) {
	        var combo = [];
	        for (var k = 0; k <= j; k++) {
	          combo.unshift(words[i - k]);
	        }
	        combos.push(combo.join(" "));
	      }
	    }
	  }
	  combos.forEach(function(combo) { addUnique(results, combo); });
	});
	return results;
}

function getMeta(attr, property, attribute, def) {
	var nodes = document.querySelectorAll("meta[" + attr + (property ? ("='" + property + "'" ) : "") + "]");
	if (nodes.length > 0) {
		return Array.prototype.map.call(nodes, function(node) {
			return node.getAttribute(attribute);
		});
	}
	return def;
}

function getOpengraphData() {
	return {
		title: getMeta("property", "og:title", "content"),
		type: getMeta("property", "og:type", "content"),
		url: getMeta("property", "og:url", "content"),
		image: getMeta("property", "og:image", "content"),
		audio: getMeta("property", "og:audio", "content"),
		determiner: getMeta("property", "og:determiner", "content"),
		locale: getMeta("property", "og:locale", "content"),
		altLocales: getMeta("property", "og:locale:alternate", "content"),
		siteName: getMeta("property", "og:site_name", "content"),
		video: getMeta("property", "og:video", "content"),
	}
}

self.port.emit("html", {
	url: document.location.href,
	title: document.title,
	direction: document.dir,
	docCharset: document.characterSet,
	metaCharset: getMeta("charset"),
	description: getMeta("name", "description", "content"),
	contentType: getMeta("http-equiv", "Content-Type", "content"),
	links: getAnchors(),
	images: getImages(),
	words: getWords(),
	opengraph: getOpengraphData()
});
