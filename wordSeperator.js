/*
 * This is a JavaScript Scratchpad.
 *
 * Enter some JavaScript, then Right Click or choose from the Execute Menu:
 * 1. Run to evaluate the selected text (Cmd-R),
 * 2. Inspect to bring up an Object Inspector on the result (Cmd-I), or,
 * 3. Display to insert the result in a comment after the selection. (Cmd-L)
 */

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
    for (var j = 0; j < 5; j++) {
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
console.log(results);

