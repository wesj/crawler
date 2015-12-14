document.body.innerHTML = "<h1>Page matches ruleset " + self.port + "</h1>";
self.port.emit("html", "hat");
