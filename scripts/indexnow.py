#!/usr/bin/env python3
"""Submit all sitemap URLs to IndexNow (Bing/Yandex instant indexing)."""
import json, urllib.request, urllib.error, re, sys

KEY = "fe0b47cda361105205be855f8e1e175b"
HOST = "csoai.org"

xml = urllib.request.urlopen(f"https://{HOST}/sitemap.xml", timeout=30).read().decode()
urls = re.findall(r"<loc>([^<]+)</loc>", xml)
payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": f"https://{HOST}/{KEY}.txt",
    "urlList": urls,
}
data = json.dumps(payload).encode()
req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=data,
    headers={"Content-Type": "application/json; charset=utf-8"},
)
try:
    r = urllib.request.urlopen(req, timeout=30)
    status = r.status
    body = ""
except urllib.error.HTTPError as e:
    status = e.code
    body = e.read().decode()[:300]

with open("INDEXNOW_STATUS.md", "w") as f:
    f.write(f"# IndexNow submission\n\nSubmitted {len(urls)} URLs — HTTP {status}\n\n{body}\n")
print(f"IndexNow: {len(urls)} URLs, HTTP {status} {body}")
# Always exit 0 so the status file gets committed for inspection
sys.exit(0)
