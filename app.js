(function () {
  "use strict";

  var form = document.getElementById("birth-form");
  var placeInput = document.getElementById("bplace");
  var suggBox = document.getElementById("place-suggestions");
  var tzLine = document.getElementById("tz-line");
  var results = document.getElementById("results");
  var statsEl = document.getElementById("stats");
  var detailsEl = document.getElementById("details");
  var graphEl = document.getElementById("bodygraph");
  var windowBtn = document.getElementById("window-btn");
  var windowOut = document.getElementById("window-out");
  var lastArgs = null;

  // ------------------------------------------------------- place search

  var db = null;          // GeoNames extract, loaded with the page
  var zoneNames = [];     // IANA names from the browser itself
  var chosen = null;      // {label, tz}

  try { zoneNames = Intl.supportedValuesOf("timeZone"); } catch (e) { }

  function fold(s) {
    s = s.toLowerCase();
    try { s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { }
    return s;
  }

  function loadPlaces(data) {
    data.folded = data.p.map(function (r) { return fold(r[0]); });
    db = data;
  }
  window.HDPlaces = { load: loadPlaces };

  if (typeof fetch === "function") {
    fetch("places.json").then(function (r) { return r.json(); })
      .then(loadPlaces).catch(function () { });
  }

  function placeLabel(r) {
    var bits = [r[0]];
    if (db.a[r[1]]) bits.push(db.a[r[1]]);
    bits.push(db.c[r[2]] || r[2]);
    return bits.join(", ");
  }

  function search(q) {
    var out = [];
    var fq = fold(q);
    if (!fq) return out;

    var offset = /^(utc|gmt)?\s*([+-]\d{1,2}(:\d{2})?)$/.exec(fq);
    if (offset) {
      var o = offset[2].indexOf(":") < 0 ? offset[2] + ":00" : offset[2];
      out.push({ label: "Fixed offset " + o, tz: o });
    }

    if (db) {
      var starts = [], contains = [];
      for (var i = 0; i < db.p.length && starts.length < 8; i++) {
        var name = db.folded[i];
        if (name.lastIndexOf(fq, 0) === 0) starts.push(i);
        else if (contains.length < 8 && fq.length > 2 && name.indexOf(fq) >= 0) contains.push(i);
      }
      starts.concat(contains).slice(0, 8).forEach(function (i) {
        var r = db.p[i];
        out.push({ label: placeLabel(r), tz: db.z[r[3]] });
      });
    }

    for (var j = 0; j < zoneNames.length && out.length < 10; j++) {
      if (fold(zoneNames[j]).indexOf(fq) >= 0) {
        out.push({ label: zoneNames[j], tz: zoneNames[j], zone: true });
      }
    }
    return out.slice(0, 8);
  }

  var active = -1;
  var currentItems = [];

  function closeSuggestions() {
    suggBox.innerHTML = "";
    suggBox.hidden = true;
    active = -1;
  }

  function pick(item) {
    chosen = item;
    placeInput.value = item.label;
    tzLine.textContent = item.zone || item.label === item.tz ?
      "" : "Timezone: " + item.tz;
    closeSuggestions();
  }

  function renderSuggestions(items) {
    if (!items.length) { closeSuggestions(); return; }
    suggBox.innerHTML = "";
    items.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "sugg";
      div.textContent = item.label + (item.zone ? " (timezone)" : "");
      div.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
        pick(item);
      });
      suggBox.appendChild(div);
    });
    suggBox.hidden = false;
    active = -1;
  }

  placeInput.addEventListener("input", function () {
    chosen = null;
    tzLine.textContent = "";
    currentItems = search(placeInput.value.trim());
    renderSuggestions(currentItems);
  });

  placeInput.addEventListener("keydown", function (ev) {
    if (suggBox.hidden) return;
    var rows = suggBox.children;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      active += ev.key === "ArrowDown" ? 1 : -1;
      active = (active + rows.length) % rows.length;
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.toggle("active", i === active);
      }
    } else if (ev.key === "Enter" && active >= 0) {
      ev.preventDefault();
      pick(currentItems[active]);
    } else if (ev.key === "Escape") {
      closeSuggestions();
    }
  });

  placeInput.addEventListener("blur", function () {
    setTimeout(closeSuggestions, 150);
  });

  function resolvePlace() {
    if (chosen) return chosen;
    var q = placeInput.value.trim();
    if (!q) return null;
    var exactZone = zoneNames.filter(function (z) {
      return fold(z) === fold(q);
    })[0];
    if (exactZone) return { label: exactZone, tz: exactZone, zone: true };
    var hits = search(q);
    return hits[0] || null;
  }

  // ------------------------------------------------------------ results

  var PLANET_LABELS = [
    ["sun", "Sun"], ["earth", "Earth"], ["northNode", "North Node"],
    ["southNode", "South Node"], ["moon", "Moon"], ["mercury", "Mercury"],
    ["venus", "Venus"], ["mars", "Mars"], ["jupiter", "Jupiter"],
    ["saturn", "Saturn"], ["uranus", "Uranus"], ["neptune", "Neptune"],
    ["pluto", "Pluto"]];

  var CENTER_LABELS = {
    Head: "Head", Ajna: "Ajna", Throat: "Throat", G: "G",
    Ego: "Heart", Sacral: "Sacral", SolarPlexus: "Solar Plexus",
    Spleen: "Spleen", Root: "Root"
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function stat(k, v) {
    return '<div class="stat"><div class="k">' + esc(k) +
      '</div><div class="v">' + esc(v) + "</div></div>";
  }

  function render(chart, usedTz) {
    statsEl.innerHTML =
      stat("Type", chart.type) +
      stat("Strategy", chart.strategy) +
      stat("Inner authority", chart.authority) +
      stat("Profile", chart.profile + " " + chart.profileName) +
      stat("Definition", chart.definition) +
      stat("Signature", chart.signature) +
      stat("Not-self theme", chart.notSelf) +
      stat("Incarnation cross", chart.cross.name + " (" + chart.cross.notation + ")");

    graphEl.innerHTML = HDBodygraph.renderToSVG({
      channels: chart.channels,
      gates: chart.gates,
      definedCenters: chart.centers,
      activations: chart.activations
    }, { maxWidth: 820 });

    var rows = PLANET_LABELS.map(function (p) {
      return "<tr><td>" + esc(p[1]) + "</td><td>" +
        esc(chart.activations.design[p[0]]) + "</td><td>" +
        esc(chart.activations.personality[p[0]]) + "</td></tr>";
    }).join("");

    var channels = chart.channels.map(function (ch) {
      return ch[0] + "-" + ch[1];
    }).join(", ") || "none";

    var centers = chart.centers.map(function (c) {
      return CENTER_LABELS[c] || c;
    }).join(", ") || "none";

    detailsEl.innerHTML =
      "<table><tr><th></th><th>Design</th><th>Personality</th></tr>" +
      rows + "</table>" +
      "<p>Defined centers: " + esc(centers) + "<br>" +
      "Channels: " + esc(channels) + "<br>" +
      "Design date: " + esc(chart.designUTC.slice(0, 10)) + " UTC<br>" +
      "Timezone used: " + esc(usedTz) + "</p>";

    windowOut.textContent = "";
    results.hidden = false;
    try { results.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { }
  }

  function calc(dateStr, timeStr, place) {
    var d = dateStr.split("-").map(Number);
    var t = timeStr.split(":").map(Number);
    lastArgs = [d[0], d[1], d[2], t[0], t[1], place.tz];
    try {
      render(HD.build.apply(null, lastArgs), place.tz);
    } catch (e) {
      alert("Could not calculate: " + e.message);
    }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var place = resolvePlace();
    if (!place) {
      alert("Birthplace not recognised. Type a town or suburb and pick it " +
        "from the list, or enter a timezone like Australia/Sydney or +10:00.");
      return;
    }
    pick(place);
    calc(document.getElementById("bdate").value,
      document.getElementById("btime").value, place);
  });

  document.querySelectorAll("[data-sample]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var parts = a.getAttribute("data-sample").split(";");
      document.getElementById("bdate").value = parts[0];
      document.getElementById("btime").value = parts[1];
      var place = { label: parts[3], tz: parts[2] };
      pick(place);
      calc(parts[0], parts[1], place);
    });
  });

  windowBtn.addEventListener("click", function () {
    if (!lastArgs) return;
    windowOut.textContent = "Checking...";
    setTimeout(function () {
      try {
        var w = HD.stability.apply(null, lastArgs);
        windowOut.textContent =
          "Any birth time from " + w.minus + " minutes earlier to " +
          w.plus + " minutes later gives this exact chart. Outside that, " +
          "something shifts.";
      } catch (e) {
        windowOut.textContent = "Could not determine: " + e.message;
      }
    }, 30);
  });
})();
