"""Build places.json for the birthplace search from GeoNames dumps (CC-BY 4.0).

Inputs (download from https://download.geonames.org/export/dump/):
  cities15000.txt        world cities with population over 15000
  AU.txt                 every named place in Australia (suburbs included)
  admin1CodesASCII.txt   state and province names
  countryInfo.txt        country names

Usage: python build_places.py <dir with the four files> <output places.json>

Any other country dump (NZ.txt, GB.txt, ...) dropped in the directory is
picked up too, so fork and widen the coverage if you want.
"""
import glob
import json
import os
import sys

KEEP_WORLD = "cities15000.txt"
EXCLUDE_CODES = {"PPLQ", "PPLH", "PPLW", "PPLCH"}  # abandoned or historical

# Places worth having that the class P filter misses.
SUPPLEMENT = [
    ("Lord Howe Island", "02", "AU", "Australia/Lord_Howe", 382),
]


def rows(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) > 17:
                yield p


def main(src, out):
    admin1 = {}
    for line in open(os.path.join(src, "admin1CodesASCII.txt"), encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        if len(p) >= 2:
            admin1[p[0]] = p[1]

    countries = {}
    for line in open(os.path.join(src, "countryInfo.txt"), encoding="utf-8"):
        if line.startswith("#"):
            continue
        p = line.split("\t")
        if len(p) > 4:
            countries[p[0]] = p[4]

    best = {}

    def add(name, a1, cc, tz, pop):
        if not name or not tz:
            return
        key = (name.lower(), a1, cc)
        if key not in best or pop > best[key][4]:
            best[key] = (name, a1, cc, tz, pop)

    for p in rows(os.path.join(src, KEEP_WORLD)):
        add(p[1], p[10], p[8], p[17], int(p[14] or 0))

    for path in glob.glob(os.path.join(src, "??.txt")):
        for p in rows(path):
            if p[6] == "P" and p[7] not in EXCLUDE_CODES:
                add(p[1], p[10], p[8], p[17], int(p[14] or 0))

    for name, a1, cc, tz, pop in SUPPLEMENT:
        add(name, a1, cc, tz, pop)

    places = sorted(best.values(), key=lambda r: -r[4])

    zones, zone_ix = [], {}
    admins, admin_ix = [], {}
    used_cc = {}
    packed = []
    for name, a1, cc, tz, pop in places:
        if tz not in zone_ix:
            zone_ix[tz] = len(zones)
            zones.append(tz)
        a1name = admin1.get(cc + "." + a1, "")
        if a1name not in admin_ix:
            admin_ix[a1name] = len(admins)
            admins.append(a1name)
        used_cc[cc] = countries.get(cc, cc)
        packed.append([name, admin_ix[a1name], cc, zone_ix[tz], pop])

    data = {"z": zones, "a": admins, "c": used_cc, "p": packed}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("places:", len(packed), "zones:", len(zones),
          "bytes:", os.path.getsize(out))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
