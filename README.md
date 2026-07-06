# hd-chart

A Human Design chart calculator that runs entirely in your browser. Enter a birth date, time, and timezone, get the full chart: type, strategy, inner authority, profile, definition, incarnation cross, defined centers, channels, all 26 activations, and the bodygraph.

The point: your birth data never leaves your device. No account, no email, no name field, no analytics, no server. After the page loads it makes zero network requests. You can check that in the network tab, or turn your wifi off and use it anyway.

## Why

The popular chart sites collect full name, email, and exact birth data. Some keep it indefinitely and say outright they use it for marketing. One widely embedded chart widget is literally a lead capture product that tags subscribers by traits derived from their birth data. None of that is needed to compute a chart. The math wants a date, a time, and a UTC offset. That's it.

## Accuracy

The chart is deterministic astronomy plus fixed lookup tables, so it either matches the official calculators or it's wrong. It matches:

- Reproduces four independently documented reference charts exactly (Ra Uru Hu, Einstein, Obama, Madonna), down to the profile lines and incarnation cross.
- Agrees with a second, independent implementation (Python, skyfield, NASA JPL DE421 ephemeris, in `tools/`) on all 1040 activations of a 40 chart random sample. Zero mismatches.
- Gate wheel, channel table, and center map cross checked against two other open source implementations.
- Planet positions come from astronomy-engine, within a couple of arcseconds of the professional ephemerides. A line on the wheel is 3375 arcseconds wide.

Run it yourself:

```
npm install
npm test
```

## Design calculation

Personality is the sky at birth. Design is the sky when the Sun was exactly 88 degrees of arc before its natal position, found by root solving, not by subtracting 88 days. Lunar node is the true (osculating) node, same as the reference calculators. Timezone conversion uses the browser's own historical tz database, so old daylight saving rules are handled.

The page also answers a question the chart sites don't: how exact does the birth time need to be? It scans forward and back and tells you the window of birth times that produce the identical chart.

## Python version

`tools/hd.py` is the same engine in Python (needs `pip install skyfield`, downloads the JPL ephemeris file on first run). `tools/validate.py` reruns the reference chart checks. Handy if you want to generate charts offline in a script.

## Hosting it yourself

It's static files. Serve the repo root with anything, or fork and turn on GitHub Pages.

## License

MIT. Bundled astronomy-engine and the bodygraph renderer are MIT too, see LICENSE for notices. No affiliation with Jovian Archive. This computes the chart; what it means, if anything, is your business.
