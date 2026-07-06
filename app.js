(function () {
  "use strict";

  var form = document.getElementById("birth-form");
  var tzInput = document.getElementById("btz");
  var results = document.getElementById("results");
  var statsEl = document.getElementById("stats");
  var detailsEl = document.getElementById("details");
  var graphEl = document.getElementById("bodygraph");
  var windowBtn = document.getElementById("window-btn");
  var windowOut = document.getElementById("window-out");
  var lastArgs = null;

  // Timezone list from the browser's own database. Free text still works
  // if the API is unavailable.
  try {
    var list = document.getElementById("tz-list");
    Intl.supportedValuesOf("timeZone").forEach(function (z) {
      var o = document.createElement("option");
      o.value = z;
      list.appendChild(o);
    });
    tzInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (e) { /* older browser, manual entry */ }

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

  function render(chart) {
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
      "Design date: " + esc(chart.designUTC.slice(0, 10)) + " UTC</p>";

    windowOut.textContent = "";
    results.hidden = false;
    try { results.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { }
  }

  function calc(dateStr, timeStr, tz) {
    var d = dateStr.split("-").map(Number);
    var t = timeStr.split(":").map(Number);
    lastArgs = [d[0], d[1], d[2], t[0], t[1], tz];
    try {
      render(HD.build.apply(null, lastArgs));
    } catch (e) {
      alert("Could not calculate: " + e.message +
        "\nCheck that the timezone is a valid name like Australia/Sydney.");
    }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    calc(document.getElementById("bdate").value,
      document.getElementById("btime").value,
      tzInput.value.trim());
  });

  document.querySelectorAll("[data-sample]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var parts = a.getAttribute("data-sample").split(",");
      document.getElementById("bdate").value = parts[0];
      document.getElementById("btime").value = parts[1];
      tzInput.value = parts[2];
      calc(parts[0], parts[1], parts[2]);
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
