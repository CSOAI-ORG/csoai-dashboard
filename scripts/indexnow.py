#!/usr/bin/env python3
"""Submit all sitemap URLs to IndexNow (Bing/Yandex instant indexing)."""
import json, urllib.request, urllib.error, re, sys

KEY = "fe0b47cda361105205be855f8e1e175b"
# The live site is councilof.ai. csoai.org still resolves but 308-redirects
# here, and IndexNow requires host + keyLocation to be the canonical host.
HOST = "councilof.ai"

# Cloudflare in front of the site 403s the default `Python-urllib/x.y`
# User-Agent, which is what made every scheduled run of sync-mcp-registry.yml
# fail at the IndexNow step. Send a real UA.
UA = "Mozilla/5.0 (compatible; CSOAI-IndexNow/1.0; +https://councilof.ai)"


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout)


xml = fetch(f"https://{HOST}/sitemap.xml").read().decode()
urls = re.findall(r"<loc>([^<]+)</loc>", xml)

# IndexNow rejects the whole submission if the key file is not reachable at
# keyLocation. Say so loudly instead of reporting a silent success.
key_location = f"https://{HOST}/{KEY}.txt"
try:
    key_status = fetch(key_location, timeout=15).status
except urllib.error.HTTPError as e:
    key_status = e.code
except Exception as e:  # noqa: BLE001
    key_status = f"error: {e}"
if key_status != 200:
    # Submitting anyway would be rejected by IndexNow and then swallowed by the
    # exit-0 below, i.e. a green run that indexed nothing. Skip loudly instead.
    msg = (f"IndexNow SKIPPED: key file {key_location} -> {key_status}. "
           f"Publish the key file at that URL (or move this step to the repo "
           f"that serves {HOST}) before IndexNow can accept a submission.")
    print(msg)
    with open("INDEXNOW_STATUS.md", "w") as f:
        f.write(f"# IndexNow submission\n\nHost: {HOST}\n\n{msg}\n\n"
                f"Sitemap had {len(urls)} URLs.\n")
    sys.exit(0)

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": key_location,
    "urlList": urls,
}
data = json.dumps(payload).encode()
req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=data,
    headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA},
)
try:
    r = urllib.request.urlopen(req, timeout=30)
    status = r.status
    body = ""
except urllib.error.HTTPError as e:
    status = e.code
    body = e.read().decode()[:300]

with open("INDEXNOW_STATUS.md", "w") as f:
    f.write(f"# IndexNow submission\n\nHost: {HOST}\n\n"
            f"Key file {key_location} -> HTTP {key_status}\n\n"
            f"Submitted {len(urls)} URLs — HTTP {status}\n\n{body}\n")
print(f"IndexNow: {len(urls)} URLs, HTTP {status} {body}")
# Always exit 0 so the status file gets committed for inspection
sys.exit(0)
