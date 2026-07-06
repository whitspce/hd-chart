"""Human Design chart calculator. Offline, private.

Pipeline: birth local time -> UTC -> planetary ecliptic longitudes (JPL DE421
via skyfield) at birth ("Personality") and at the moment the Sun was 88 deg
of arc earlier ("Design") -> map each longitude onto the 64-gate wheel ->
derive channels, centers, type, authority, profile, definition, cross.
"""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import numpy as np
from skyfield.api import Loader
from skyfield.framelib import ecliptic_frame

# ---------------------------------------------------------------- constants
# The published Human Design constants. Cross-checked against two independent
# implementations (jdempcy/hdkit, CReizner/SharpAstrology.HumanDesign) and
# validated against four documented reference charts; see README.

# Zodiacal order of the 64 gates. The wheel starts with Gate 41 at
# WHEEL_START absolute tropical longitude (2 deg Aquarius). Each gate spans
# 5.625 deg, each of its 6 lines spans 0.9375 deg.
WHEEL_START = 302.0
GATE_ORDER = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
]

GATE_CENTER = {
    64: "Head", 61: "Head", 63: "Head",
    47: "Ajna", 24: "Ajna", 4: "Ajna", 17: "Ajna", 43: "Ajna", 11: "Ajna",
    62: "Throat", 23: "Throat", 56: "Throat", 35: "Throat", 12: "Throat",
    45: "Throat", 33: "Throat", 8: "Throat", 31: "Throat", 20: "Throat",
    16: "Throat",
    1: "G", 13: "G", 25: "G", 46: "G", 2: "G", 15: "G", 10: "G", 7: "G",
    21: "Heart", 40: "Heart", 26: "Heart", 51: "Heart",
    34: "Sacral", 5: "Sacral", 14: "Sacral", 29: "Sacral", 59: "Sacral",
    9: "Sacral", 3: "Sacral", 42: "Sacral", 27: "Sacral",
    48: "Spleen", 57: "Spleen", 44: "Spleen", 50: "Spleen", 32: "Spleen",
    28: "Spleen", 18: "Spleen",
    36: "SolarPlexus", 22: "SolarPlexus", 37: "SolarPlexus", 6: "SolarPlexus",
    49: "SolarPlexus", 55: "SolarPlexus", 30: "SolarPlexus",
    53: "Root", 60: "Root", 52: "Root", 19: "Root", 39: "Root", 41: "Root",
    58: "Root", 38: "Root", 54: "Root",
}

CHANNELS = [
    (64, 47), (61, 24), (63, 4),
    (17, 62), (43, 23), (11, 56),
    (31, 7), (8, 1), (33, 13),
    (20, 34), (20, 57), (20, 10), (16, 48), (12, 22), (35, 36), (45, 21),
    (2, 14), (46, 29), (15, 5), (10, 34), (10, 57), (25, 51),
    (53, 42), (60, 3), (52, 9), (27, 50), (34, 57), (59, 6),
    (32, 54), (28, 38), (18, 58),
    (19, 49), (39, 55), (41, 30),
    (26, 44), (40, 37),
]

MOTORS = {"Sacral", "Heart", "SolarPlexus", "Root"}

PLANET_KEYS = [
    ("Sun", "sun"), ("Earth", None), ("Moon", "moon"),
    ("NorthNode", None), ("SouthNode", None),
    ("Mercury", "mercury"), ("Venus", "venus"), ("Mars", "mars"),
    ("Jupiter", "jupiter barycenter"), ("Saturn", "saturn barycenter"),
    ("Uranus", "uranus barycenter"), ("Neptune", "neptune barycenter"),
    ("Pluto", "pluto barycenter"),
]

DESIGN_ARC_DEG = 88.0

# ------------------------------------------------------------- ephemeris

_load = Loader(".", verbose=False)
_ts = _load.timescale()
_eph = _load("de421.bsp")
_earth = _eph["earth"]


def _lon_of(body_key, t):
    """Apparent geocentric ecliptic longitude of date, degrees."""
    body = _eph[body_key]
    _, lon, _ = _earth.at(t).observe(body).apparent().frame_latlon(ecliptic_frame)
    return lon.degrees % 360.0


def _true_node_lon(t):
    """Osculating (true) ascending lunar node from the geocentric state vector."""
    r, v = (_eph["moon"] - _eph["earth"]).at(t).frame_xyz_and_velocity(ecliptic_frame)
    h = np.cross(r.km, v.km_per_s)
    return float(np.degrees(np.arctan2(h[0], -h[1])) % 360.0)


def _mean_node_lon(t):
    """Mean lunar node, Meeus polynomial."""
    T = (t.tt - 2451545.0) / 36525.0
    om = (125.0445479 - 1934.1362891 * T + 0.0020754 * T**2
          + T**3 / 467441.0 - T**4 / 60616000.0)
    return om % 360.0


def positions(t, node="true"):
    """Longitudes of the 13 Human Design points at skyfield time t."""
    sun = _lon_of("sun", t)
    node_lon = _true_node_lon(t) if node == "true" else _mean_node_lon(t)
    out = {}
    for name, key in PLANET_KEYS:
        if name == "Sun":
            out[name] = sun
        elif name == "Earth":
            out[name] = (sun + 180.0) % 360.0
        elif name == "NorthNode":
            out[name] = node_lon
        elif name == "SouthNode":
            out[name] = (node_lon + 180.0) % 360.0
        else:
            out[name] = _lon_of(key, t)
    return out


def design_time(t_birth):
    """Instant when the Sun was DESIGN_ARC_DEG of arc before its natal position."""
    target = (_lon_of("sun", t_birth) - DESIGN_ARC_DEG) % 360.0
    t = _ts.tt_jd(t_birth.tt - DESIGN_ARC_DEG / 0.9856)
    for _ in range(30):
        lon = _lon_of("sun", t)
        delta = (target - lon + 180.0) % 360.0 - 180.0
        if abs(delta) < 1e-7:
            break
        rate = (_lon_of("sun", _ts.tt_jd(t.tt + 0.5)) - lon + 180.0) % 360.0 - 180.0
        t = _ts.tt_jd(t.tt + delta / (rate * 2.0))
    return t

# ------------------------------------------------------------- wheel logic


def gate_line(lon):
    off = (lon - WHEEL_START) % 360.0
    idx = int(off // 5.625)
    line = int((off % 5.625) // 0.9375) + 1
    return GATE_ORDER[idx], line

# ------------------------------------------------------------- chart


def _connected(defined_centers, defined_channels, start, targets):
    """True if `start` center reaches any of `targets` through defined channels."""
    if start not in defined_centers:
        return False
    adj = {}
    for a, b in defined_channels:
        ca, cb = GATE_CENTER[a], GATE_CENTER[b]
        adj.setdefault(ca, set()).add(cb)
        adj.setdefault(cb, set()).add(ca)
    seen, stack = {start}, [start]
    while stack:
        for nxt in adj.get(stack.pop(), ()):
            if nxt in targets:
                return True
            if nxt not in seen:
                seen.add(nxt)
                stack.append(nxt)
    return False


def _tz(tz_name):
    """IANA name, or a fixed offset like '+00:40' / '-10:00' (e.g. LMT births)."""
    if tz_name[0] in "+-":
        from datetime import timezone
        h, m = tz_name[1:].split(":")
        sign = 1 if tz_name[0] == "+" else -1
        return timezone(sign * timedelta(hours=int(h), minutes=int(m)))
    return ZoneInfo(tz_name)


def chart(year, month, day, hour, minute, tz_name, node="true"):
    local = datetime(year, month, day, hour, minute, tzinfo=_tz(tz_name))
    utc = local.astimezone(ZoneInfo("UTC"))
    t_p = _ts.utc(utc.year, utc.month, utc.day, utc.hour, utc.minute, utc.second)
    t_d = design_time(t_p)

    pers = {k: gate_line(v) for k, v in positions(t_p, node).items()}
    des = {k: gate_line(v) for k, v in positions(t_d, node).items()}

    gates = {g for g, _ in pers.values()} | {g for g, _ in des.values()}
    defined_channels = [(a, b) for a, b in CHANNELS if a in gates and b in gates]
    centers = set()
    for a, b in defined_channels:
        centers.add(GATE_CENTER[a])
        centers.add(GATE_CENTER[b])

    # type
    motor_to_throat = _connected(centers, defined_channels, "Throat", MOTORS)
    if not centers:
        typ = "Reflector"
    elif "Sacral" in centers:
        typ = "Manifesting Generator" if motor_to_throat else "Generator"
    else:
        typ = "Manifestor" if motor_to_throat else "Projector"

    # authority
    if not centers:
        auth = "Lunar (Reflector)"
    elif "SolarPlexus" in centers:
        auth = "Emotional"
    elif "Sacral" in centers:
        auth = "Sacral"
    elif "Spleen" in centers:
        auth = "Splenic"
    elif "Heart" in centers:
        auth = "Ego"
    elif "G" in centers:
        auth = "Self-Projected"
    else:
        auth = "Mental / Environmental"

    profile = (pers["Sun"][1], des["Sun"][1])

    # definition: connected components of defined centers
    comps = 0
    unvisited = set(centers)
    while unvisited:
        seed = next(iter(unvisited))
        seen, stack = {seed}, [seed]
        adj = {}
        for a, b in defined_channels:
            ca, cb = GATE_CENTER[a], GATE_CENTER[b]
            adj.setdefault(ca, set()).add(cb)
            adj.setdefault(cb, set()).add(ca)
        while stack:
            for nxt in adj.get(stack.pop(), ()):
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        unvisited -= seen
        comps += 1
    definition = {0: "None", 1: "Single", 2: "Split", 3: "Triple Split",
                  4: "Quadruple Split"}.get(comps, str(comps))

    cross = (pers["Sun"][0], pers["Earth"][0], des["Sun"][0], des["Earth"][0])

    return {
        "personality": pers, "design": des,
        "design_utc": t_d.utc_strftime("%Y-%m-%d %H:%M:%S"),
        "type": typ, "authority": auth,
        "profile": "%d/%d" % profile,
        "definition": definition,
        "centers": sorted(centers),
        "channels": sorted(defined_channels),
        "gates": sorted(gates),
        "cross": cross,
    }


def _signature(t_p, node):
    t_d = design_time(t_p)
    return (tuple(sorted((k,) + gate_line(v) for k, v in positions(t_p, node).items())),
            tuple(sorted((k,) + gate_line(v) for k, v in positions(t_d, node).items())))


def stability(year, month, day, hour, minute, tz_name, node="true"):
    """Minutes the birth time can shift each way with an identical chart.

    Estimates each point's time-to-next-line-boundary from its motion rate,
    then verifies the resulting window with direct recomputation.
    """
    local = datetime(year, month, day, hour, minute, tzinfo=_tz(tz_name))
    utc = local.astimezone(ZoneInfo("UTC"))
    t_p = _ts.utc(utc.year, utc.month, utc.day, utc.hour, utc.minute, utc.second)
    t_d = design_time(t_p)

    fwd, bwd = [], []
    for t in (t_p, t_d):
        pos = positions(t, node)
        pos2 = positions(_ts.tt_jd(t.tt + 1.0 / 48), node)  # +30 min
        for name in pos:
            rate = ((pos2[name] - pos[name] + 180.0) % 360.0 - 180.0) / (1.0 / 48)
            if abs(rate) < 1e-4:
                continue
            frac = (pos[name] - WHEEL_START) % 0.9375
            up, down = 0.9375 - frac, frac
            d_fwd, d_bwd = (up, down) if rate > 0 else (down, up)
            fwd.append((d_fwd / abs(rate) * 1440, name))
            bwd.append((d_bwd / abs(rate) * 1440, name))

    plus, who_p = min(fwd)
    minus, who_m = min(bwd)

    # rates are only locally linear, so refine each edge by direct scan
    sig = _signature(t_p, node)

    def refine(est, sign):
        m = max(1, int(est) - 5)
        while _signature(_ts.tt_jd(t_p.tt + sign * m / 1440.0), node) == sig:
            m += 1
            if m > est + 30:
                raise RuntimeError("boundary not found near estimate")
        return m - 1  # last minute offset with an identical chart

    return refine(minus, -1), refine(plus, +1), who_m, who_p


def print_chart(c):
    print("Type:       ", c["type"])
    print("Profile:    ", c["profile"])
    print("Authority:  ", c["authority"])
    print("Definition: ", c["definition"])
    print("Cross gates: P-Sun %d / P-Earth %d | D-Sun %d / D-Earth %d" % c["cross"])
    print("Design date (UTC):", c["design_utc"])
    print("Defined centers:", ", ".join(c["centers"]) or "none")
    print("Channels:", ", ".join("%d-%d" % ch for ch in c["channels"]) or "none")
    print("Personality:      Design:")
    for name, _ in PLANET_KEYS:
        pg, pl = c["personality"][name]
        dg, dl = c["design"][name]
        print("  %-10s %2d.%d   |   %2d.%d" % (name, pg, pl, dg, dl))


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 7:
        print("usage: python hd.py YEAR MONTH DAY HOUR MINUTE TIMEZONE [--window]")
        print("   eg: python hd.py 1990 6 15 14 30 Australia/Sydney")
        print("timezone is an IANA name, or a fixed offset like +10:00")
        print("--window also reports how far the birth time can shift")
        print("         before the chart changes (takes a minute to run)")
        sys.exit(1)
    y, mo, d, h, mi = (int(x) for x in sys.argv[1:6])
    tz = sys.argv[6]
    print_chart(chart(y, mo, d, h, mi, tz))
    if "--window" in sys.argv:
        m, p, wm, wp = stability(y, mo, d, h, mi, tz)
        print("Identical chart from %d min before to %d min after the stated"
              " time" % (m, p))
        print("(nearest boundaries: %s going back, %s going forward)" % (wm, wp))
