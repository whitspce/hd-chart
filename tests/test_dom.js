/* Browser smoke test: load index.html in jsdom with scripts enabled,
 * fill the form, submit, and verify the rendered results. */
var fs = require("fs");
var path = require("path");
var { JSDOM } = require("jsdom");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
var w = dom.window;

["astronomy.browser.min.js", "engine.js", "bodygraph.js", "app.js"].forEach(function (f) {
  w.eval(fs.readFileSync(path.join(__dirname, "..", f), "utf8"));
});

console.log("globals: Astronomy", typeof w.Astronomy, "| HD", typeof w.HD,
  "| HDBodygraph", typeof w.HDBodygraph);

var d = w.document;
var failures = 0;

function expect(label, cond) {
  if (!cond) { failures++; console.log("FAIL " + label); }
  else console.log("ok   " + label);
}

// timezone datalist populated
expect("tz datalist has entries", d.querySelectorAll("#tz-list option").length > 100);

// simulate: fill Ra's data and submit
d.getElementById("bdate").value = "1948-04-09";
d.getElementById("btime").value = "00:05";
d.getElementById("btz").value = "America/Toronto";
d.getElementById("birth-form").dispatchEvent(
  new w.Event("submit", { bubbles: true, cancelable: true }));

var stats = d.getElementById("stats").textContent;
expect("results visible", !d.getElementById("results").hidden);
expect("type Manifestor", stats.indexOf("Manifestor") >= 0);
expect("profile 5/1", stats.indexOf("5/1") >= 0);
expect("authority Splenic", stats.indexOf("Splenic") >= 0);
expect("cross Clarion", stats.indexOf("Clarion") >= 0);
expect("bodygraph svg present", d.querySelectorAll("#bodygraph svg").length === 1);
expect("activation table rows", d.querySelectorAll("#details table tr").length === 14);
expect("channels listed", d.getElementById("details").textContent.indexOf("25-51") >= 0);

// sample link wiring
var link = d.querySelector('[data-sample*="1961"]');
link.dispatchEvent(new w.Event("click", { bubbles: true, cancelable: true }));
expect("obama sample renders 6/2 Projector",
  d.getElementById("stats").textContent.indexOf("6/2") >= 0 &&
  d.getElementById("stats").textContent.indexOf("Projector") >= 0);

console.log(failures ? failures + " FAILURES" : "DOM TEST PASS");
process.exit(failures ? 1 : 0);
