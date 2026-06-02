#!/usr/bin/env python3
"""Regenerate client/public/sitemap.xml from the MCP registry + framework data.

Run from repo root. Includes core pages, every /frameworks/:slug and every
/mcp/:slug so the full surface stays indexable as the fleet grows.
"""
import json
import re
import datetime

B = "https://csoai.org"
D = datetime.date.today().isoformat()

CORE = [
    ("/", "daily", "1.0"), ("/crosswalks", "weekly", "0.9"), ("/mcp", "daily", "0.9"),
    ("/charter", "weekly", "0.9"), ("/ei3", "monthly", "0.7"), ("/about", "weekly", "0.8"),
    ("/how-it-works", "weekly", "0.7"), ("/training", "weekly", "0.9"), ("/courses", "weekly", "0.8"),
    ("/certification", "weekly", "0.9"), ("/exam", "monthly", "0.7"), ("/compliance", "weekly", "0.8"),
    ("/compliance/eu-ai-act", "weekly", "0.9"), ("/compliance/nist-ai-rmf", "weekly", "0.8"),
    ("/compliance/tc260", "monthly", "0.7"), ("/compliance/uk-ai-bill", "monthly", "0.7"),
    ("/compliance/canada-ai-act", "monthly", "0.7"), ("/compliance/australia-ai-governance", "monthly", "0.7"),
    ("/global-ai-safety-initiative", "weekly", "0.8"), ("/soai-pdca", "weekly", "0.8"),
    ("/pdca-simulator", "monthly", "0.7"), ("/watchdog", "daily", "0.9"), ("/jobs", "daily", "0.8"),
    ("/leaderboard", "daily", "0.7"), ("/enterprise", "weekly", "0.9"), ("/pricing", "weekly", "0.9"),
    ("/api-docs", "monthly", "0.7"), ("/resources", "weekly", "0.7"), ("/accreditation", "monthly", "0.7"),
    ("/standards", "monthly", "0.7"), ("/knowledge-base", "weekly", "0.6"), ("/blog", "weekly", "0.6"),
]


def main():
    reg = json.load(open("client/src/data/mcpRegistry.json"))
    fw_slugs = re.findall(r'slug:\s*"([^"]+)"', open("client/src/data/frameworks.ts").read())

    urls = list(CORE)
    urls += [(f"/frameworks/{s}", "monthly", "0.8") for s in fw_slugs]
    urls += [(f"/mcp/{srv['slug']}", "monthly", "0.6") for srv in reg["servers"]]

    seen, lines = set(), ['<?xml version="1.0" encoding="UTF-8"?>',
                          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for p, cf, pr in urls:
        if p in seen:
            continue
        seen.add(p)
        lines += ["  <url>", f"    <loc>{B}{p}</loc>", f"    <lastmod>{D}</lastmod>",
                  f"    <changefreq>{cf}</changefreq>", f"    <priority>{pr}</priority>", "  </url>"]
    lines.append("</urlset>")
    open("client/public/sitemap.xml", "w").write("\n".join(lines) + "\n")
    print(f"sitemap: {len(seen)} URLs ({len(fw_slugs)} frameworks + {len(reg['servers'])} MCPs)")


if __name__ == "__main__":
    main()
