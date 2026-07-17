/* Browser smoke test: load index.html in jsdom with the real scripts,
 * exercise the place search, submit the form, and verify the results. */
var fs = require("fs");
var path = require("path");
var { JSDOM } = require("jsdom");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
var dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.test/" });
var w = dom.window;

["astronomy.browser.min.js", "engine.js", "bodygraph.js", "app.js"].forEach(function (f) {
  w.eval(fs.readFileSync(path.join(root, f), "utf8"));
});

// The page fetches places.json; jsdom has no server, so inject it directly.
w.HDPlaces.load(JSON.parse(fs.readFileSync(path.join(root, "places.json"), "utf8")));

var d = w.document;
var failures = 0;

function expect(label, cond) {
  if (!cond) { failures++; console.log("FAIL " + label); }
  else console.log("ok   " + label);
}

function type(el, text) {
  el.value = text;
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
}

// place search: suburb resolves to its timezone
var place = d.getElementById("bplace");
type(place, "Macquarie Park");
var suggs = d.querySelectorAll("#place-suggestions .sugg");
expect("suburb suggestion appears", suggs.length >= 1 &&
  suggs[0].textContent.indexOf("Macquarie Park, New South Wales") === 0);
suggs[0].dispatchEvent(new w.Event("mousedown", { bubbles: true, cancelable: true }));
expect("timezone resolved to Sydney",
  d.getElementById("tz-line").textContent === "Timezone: Australia/Sydney");

// timezone boundary case: Broken Hill is NSW but on Adelaide time
type(place, "Broken Hill");
suggs = d.querySelectorAll("#place-suggestions .sugg");
suggs[0].dispatchEvent(new w.Event("mousedown", { bubbles: true, cancelable: true }));
expect("Broken Hill gets its own zone",
  d.getElementById("tz-line").textContent === "Timezone: Australia/Broken_Hill");

// raw IANA zone entry still works
type(place, "America/Toronto");
var hit = d.querySelectorAll("#place-suggestions .sugg");
expect("zone name searchable", Array.prototype.some.call(hit, function (s) {
  return s.textContent.indexOf("America/Toronto (timezone)") >= 0;
}));

// full flow: Ra Uru Hu via the form with a typed place
type(place, "Montreal");
suggs = d.querySelectorAll("#place-suggestions .sugg");
var montreal = Array.prototype.filter.call(suggs, function (s) {
  return /^Montr[eé]al, Quebec, Canada/.test(s.textContent);
})[0];
expect("Montreal suggested", !!montreal);
montreal.dispatchEvent(new w.Event("mousedown", { bubbles: true, cancelable: true }));
d.getElementById("bdate").value = "1948-04-09";
d.getElementById("btime").value = "00:05";
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
expect("timezone shown in details",
  d.getElementById("details").textContent.indexOf("America/Toronto") >= 0);

// sample link wiring
var link = d.querySelector('[data-sample^="1961"]');
link.dispatchEvent(new w.Event("click", { bubbles: true, cancelable: true }));
expect("obama sample renders 6/2 Projector",
  d.getElementById("stats").textContent.indexOf("6/2") >= 0 &&
  d.getElementById("stats").textContent.indexOf("Projector") >= 0);

// fixed offset entry
type(place, "+10:00");
suggs = d.querySelectorAll("#place-suggestions .sugg");
expect("fixed offset accepted", suggs.length >= 1 &&
  suggs[0].textContent.indexOf("Fixed offset +10:00") === 0);

// unknown time mode: whole day sweep
var unknown = d.getElementById("btime-unknown");
unknown.checked = true;
unknown.dispatchEvent(new w.Event("change", { bubbles: true }));
expect("time input disabled in unknown mode", d.getElementById("btime").disabled);

type(place, "Macquarie Park");
d.querySelector("#place-suggestions .sugg").dispatchEvent(
  new w.Event("mousedown", { bubbles: true, cancelable: true }));
d.getElementById("bdate").value = "1990-06-15";
d.getElementById("birth-form").dispatchEvent(
  new w.Event("submit", { bubbles: true, cancelable: true }));
expect("sweep card shown", !d.getElementById("sweep-card").hidden);
expect("chart cards hidden", d.getElementById("stats-card").hidden);

var t0 = Date.now();
(function poll() {
  var txt = d.getElementById("sweep-out").textContent;
  if (txt.indexOf("23:59") >= 0 || txt.indexOf("all day") >= 0) {
    expect("sweep table rendered", true);
    expect("sweep finds the known type split",
      txt.indexOf("Projector") >= 0 && txt.indexOf("Manifestor") >= 0);
    expect("stable facts marked all day", txt.indexOf("all day") >= 0);
    finish();
  } else if (Date.now() - t0 > 60000) {
    expect("sweep table rendered", false);
    finish();
  } else {
    setTimeout(poll, 200);
  }
})();

function finish() {
  console.log(failures ? failures + " FAILURES" : "DOM TEST PASS");
  process.exit(failures ? 1 : 0);
}
