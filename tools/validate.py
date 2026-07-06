"""Validate hd.py against publicly documented reference charts."""
import hd

CASES = [
    # name, birth args, expected (type, profile, authority, definition, cross gates)
    ("Ra Uru Hu", (1948, 4, 9, 0, 5, "America/Toronto"),
     ("Manifestor", "5/1", "Splenic", "Single", (51, 57, 61, 62))),
    ("Obama", (1961, 8, 4, 19, 24, "Pacific/Honolulu"),
     ("Projector", "6/2", "Emotional", "Single", (33, 19, 2, 1))),
    ("Madonna", (1958, 8, 16, 7, 5, "America/Detroit"),
     ("Generator", "5/1", "Sacral", "Split", (4, 49, 8, 14))),
]


def run(node):
    print("=== node model: %s ===" % node)
    for name, args, exp in CASES:
        c = hd.chart(*args, node=node)
        got = (c["type"], c["profile"], c["authority"], c["definition"], c["cross"])
        ok = "PASS" if got == exp else "FAIL"
        print("%-10s %s" % (name, ok))
        print("   expected:", exp)
        print("   got:     ", got)
        if ok == "FAIL":
            print("   centers:", c["centers"])
            print("   channels:", c["channels"])


if __name__ == "__main__":
    run("true")
