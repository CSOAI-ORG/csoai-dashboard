#!/usr/bin/env python3
"""Generate client/src/data/mcpRegistry.json from a JSON array of GitHub repos.

Usage:
    gh api "/orgs/CSOAI-ORG/repos?per_page=100" --paginate --slurp > repos.json
    python3 scripts/build_mcp_registry.py repos.json

Only repos whose name contains "mcp" are included. Output is written to
client/src/data/mcpRegistry.json. Refuses to write if fewer than 50 MCPs are
found (guards against a failed fetch wiping the registry).
"""
import json
import re
import sys
import datetime
from collections import Counter

OUT_PATH = "client/src/data/mcpRegistry.json"

# Third-party "awesome list" aggregator repos that get scraped into the org but
# are NOT MEOK MCP products — exclude so the public catalogue only lists real servers.
EXCLUDE_SLUGS = {
    "appcypher-awesome-mcp-servers", "awesome-devops-mcp-servers", "awesome-mcp-list",
    "awesome-mcp-security", "awesome-mcp-servers", "awesome-mcp-servers-1",
    "awesome-mcp-servers-2", "best-of-mcp-servers", "wong2-awesome-mcp-servers",
}
EXCLUDE_PATTERN = re.compile(r"awesome|best-of-mcp", re.I)

CATEGORIES = [
    ("Compliance & Regulatory", r"eu ai act|iso 42001|iso/iec 42001|nist|dora|nis2|gdpr|hipaa|compliance|regulat|article \d|aml|basel|cra |audit|attestation|incident|bill of materials|ai-bom|self-audit"),
    ("Safety & Security", r"firewall|prompt injection|bias|red.?team|threat|vulnerab|security|guard|watermark|safety|moderation|content"),
    ("Agent Infrastructure (A2A)", r"a2a|agent-to-agent|handoff|delegation|orchestrat|negotiation|router|rate.?limit|token budget|cost alloc|identity|trust|policy enforce|replay|substrate|council|bft"),
    ("Payments & Commerce", r"payment|commerce|paywall|x402|billing|checkout|cart|invoice"),
    ("Data & Privacy", r"data residency|privacy|classification|gdpr|pii|anonym"),
    ("Industry Verticals", r"healthcare|legal|finance|financial|insurance|maritime|aviation|airspace|drone|agricultur|mining|energy|telecom|retail|real estate|construction|gaming|space|automotive|autonomous vehicle|education|sports|media|advertising|biometric|law enforcement|employment|supply chain|industrial|travel|hospitality"),
    ("Developer & Ops Tools", r"docs|api|test|backup|gateway|ops|monitor|ci/cd|deploy|generator|transformer|analytics|debug"),
    ("AI Content & Creative", r"ad copy|content|ascii|copy gen|creative|image|video|writing"),
]

FRAMEWORKS = {
    "EU AI Act": r"eu ai act|article \d+|article\d+|ai-bom|bill of materials|art \d+|annex iii|watermark|article 50|article 73|article 11|article 12|article 10|article 14",
    "ISO 42001": r"iso 42001|iso/iec 42001|clause \d|annex a",
    "NIST AI RMF": r"nist",
    "DORA": r"\bdora\b",
    "NIS2": r"\bnis2\b",
    "GDPR": r"gdpr|data residency|privacy|chapter v",
    "HIPAA": r"hipaa|healthcare",
    "OWASP LLM": r"owasp|prompt injection",
}


def load_repos(path):
    """Decode one or more concatenated JSON arrays/objects (gh --paginate output)."""
    with open(path) as f:
        text = f.read()
    decoder = json.JSONDecoder()
    repos = []
    idx, n = 0, len(text)
    while idx < n:
        while idx < n and text[idx].isspace():
            idx += 1
        if idx >= n:
            break
        data, end = decoder.raw_decode(text, idx)
        repos.extend(data if isinstance(data, list) else [data])
        idx = end
    return repos


def categorize(text):
    for label, pat in CATEGORIES:
        if re.search(pat, text):
            return label
    return "General AI Automation"


def frameworks(text):
    return [fw for fw, pat in FRAMEWORKS.items() if re.search(pat, text)]


def clean_name(name):
    n = name[:-4] if name.lower().endswith("-mcp") else name
    return n.replace("-", " ").title().replace("Ai ", "AI ").replace("Api", "API")


def main():
    if len(sys.argv) < 2:
        print("usage: build_mcp_registry.py <repos.json>", file=sys.stderr)
        sys.exit(2)

    repos = load_repos(sys.argv[1])
    mcps = [r for r in repos
            if "mcp" in (r.get("name") or "").lower()
            and (r.get("name") or "").lower() not in EXCLUDE_SLUGS
            and not EXCLUDE_PATTERN.search(r.get("name") or "")]

    registry = []
    for r in mcps:
        desc = (r.get("description") or "").strip()
        text = (r["name"] + " " + desc).lower()
        registry.append({
            "slug": r["name"],
            "name": clean_name(r["name"]),
            "description": desc or "MCP server - Model Context Protocol tool.",
            "url": r.get("html_url") or ("https://github.com/CSOAI-ORG/" + r["name"]),
            "category": categorize(text),
            "frameworks": frameworks(text),
            "language": r.get("language") or "Python",
            "meokLabs": bool(desc and "meok" in desc.lower()),
            "updatedAt": r.get("pushed_at"),
        })

    cat_order = {c[0]: i for i, c in enumerate(CATEGORIES)}
    cat_order["General AI Automation"] = 99
    registry.sort(key=lambda x: (cat_order.get(x["category"], 50), x["name"]))

    cats = Counter(x["category"] for x in registry)
    fw = Counter(t for x in registry for t in x["frameworks"])

    out = {
        "generatedAt": datetime.date.today().isoformat(),
        "total": len(registry),
        "source": "https://github.com/orgs/CSOAI-ORG/repositories",
        "categories": [{"name": k, "count": v} for k, v in sorted(cats.items(), key=lambda kv: (cat_order.get(kv[0], 50), kv[0]))],
        "frameworkCounts": [{"name": k, "count": v} for k, v in fw.most_common()],
        "servers": registry,
    }

    if len(registry) < 50:
        print("Refusing to write - only %d MCPs found (expected 200+)." % len(registry), file=sys.stderr)
        sys.exit(1)

    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2)
    print("Wrote %d MCP servers to %s" % (len(registry), OUT_PATH))


if __name__ == "__main__":
    main()
