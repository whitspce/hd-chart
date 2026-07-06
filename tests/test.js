/* Validation suite for the Human Design engine.
 * Part 1: four publicly documented reference charts.
 * Part 2: cross-check all 26 activations against an independent Python
 * implementation (skyfield + JPL DE421) over a random sample, if
 * reference_charts.json is present.
 */
var HD = require("../engine.js");
var fs = require("fs");

var failures = 0;

function check(label, got, want) {
  var ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    failures++;
    console.log("FAIL " + label + "\n  want " + JSON.stringify(want) +
      "\n  got  " + JSON.stringify(got));
  }
  return ok;
}

var REFS = [
  ["Ra Uru Hu", [1948, 4, 9, 0, 5, "America/Toronto"],
    ["Manifestor", "5/1", "Splenic", "Single", [51, 57, 61, 62],
      "Left Angle Cross of the Clarion"]],
  ["Einstein", [1879, 3, 14, 11, 30, "+00:40"],
    ["Generator", "1/4", "Emotional", "Split", [36, 6, 11, 12],
      "Right Angle Cross of the Eden"]],
  ["Obama", [1961, 8, 4, 19, 24, "Pacific/Honolulu"],
    ["Projector", "6/2", "Emotional", "Single", [33, 19, 2, 1],
      "Left Angle Cross of Refinement"]],
  ["Madonna", [1958, 8, 16, 7, 5, "America/Detroit"],
    ["Generator", "5/1", "Sacral", "Split", [4, 49, 8, 14],
      "Left Angle Cross of Revolution 2"]]
];

console.log("== reference charts ==");
REFS.forEach(function (r) {
  var c = HD.build.apply(null, r[1]);
  var ok = check(r[0],
    [c.type, c.profile, c.authority, c.definition, c.cross.gates, c.cross.name],
    r[2]);
  if (ok) console.log("PASS " + r[0]);
});

if (fs.existsSync(__dirname + "/reference_charts.json")) {
  console.log("== cross-check vs Python/skyfield ==");
  var refs = JSON.parse(fs.readFileSync(__dirname + "/reference_charts.json", "utf8"));
  var mismatch = 0, boundary = 0, total = 0;
  refs.forEach(function (r) {
    var c = HD.build(r.y, r.mo, r.d, r.h, r.mi, r.tz);
    ["personality", "design"].forEach(function (side) {
      for (var k in r[side]) {
        total++;
        var got = c[side][k].gate + "." + c[side][k].line;
        if (got !== r[side][k].gl) {
          var dist = Math.abs(r[side][k].boundary_arcsec);
          if (dist < 30) { boundary++; }
          else {
            mismatch++;
            console.log("MISMATCH " + JSON.stringify(r.args) + " " + side + "." + k +
              " py=" + r[side][k].gl + " js=" + got +
              " (" + dist.toFixed(1) + " arcsec from boundary)");
          }
        }
      }
    });
  });
  console.log(total + " activations compared, " + mismatch + " real mismatches, " +
    boundary + " boundary ties (position within 30 arcsec of a line edge)");
  failures += mismatch;
}

console.log(failures === 0 ? "ALL PASS" : failures + " FAILURES");
process.exit(failures ? 1 : 0);
