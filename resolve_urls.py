import json
import urllib.request
import re

urls = {
    "instagram": [
        "https://www.instagram.com/reel/DaOEmhnxW9b/",
        "https://www.instagram.com/reel/DaIt1H5RJfl/",
        "https://www.instagram.com/reel/DZ2um57xOVH/",
        "https://www.instagram.com/reel/DZLTIIjB-5O/",
        "https://www.instagram.com/reel/DXepXhRCO7Z/",
        "https://www.instagram.com/reel/DZciMG6xjdM/",
        "https://www.instagram.com/reel/DaBDvEVFXWY/"
    ],
    "tiktok": [
        "https://www.tiktok.com/@madisonknowsbest/video/7627564819259886879",
        "https://vt.tiktok.com/ZSCQXU66m/",
        "https://vt.tiktok.com/ZSCQXACjx/",
        "https://vt.tiktok.com/ZSCQXga4x/",
        "https://vt.tiktok.com/ZSCQXQQ1G/",
        "https://vt.tiktok.com/ZSCQ4MvmE/",
        "https://vt.tiktok.com/ZSCQ4AFX9/",
        "https://www.instagram.com/reel/DadTzzZOths/",
        "https://vt.tiktok.com/ZSX1F26XJ/",
        "https://vt.tiktok.com/ZSX1Fd7KL/",
        "https://vt.tiktok.com/ZSX1FxxuT/",
        "https://vt.tiktok.com/ZSX1FyYxr/",
        "https://vt.tiktok.com/ZSX1FVhxD/",
        "https://vt.tiktok.com/ZSX1Fposx/"
    ],
    "facebook": [
        "https://www.instagram.com/reel/DaBPjX3FdK2/",
        "https://www.instagram.com/reel/DZprwZRlV9R/",
        "https://www.instagram.com/reel/DXxX6cRiWiF/",
        "https://www.instagram.com/reel/DXw-Kjuua76/",
        "https://www.instagram.com/reel/DVEoiHhkv7R/"
    ],
    "youtube": [
        "https://vt.tiktok.com/ZSX1NEBBV/",
        "https://vt.tiktok.com/ZSX1Fk8hD/",
        "https://vt.tiktok.com/ZSX1FJc9m/"
    ]
}

class HeadRequest(urllib.request.Request):
    def get_method(self):
        return "HEAD"

def resolve_url(url):
    if "vt.tiktok.com" in url:
        try:
            req = HeadRequest(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req)
            return res.geturl()
        except Exception as e:
            # If HEAD fails, try GET with redirect interception or just GET
            try:
                req2 = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                res2 = urllib.request.urlopen(req2)
                return res2.geturl()
            except Exception as e2:
                print(f"Failed to resolve {url}: {e2}")
                return url
    return url

results = []
for network, links in urls.items():
    for i, link in enumerate(links):
        resolved = resolve_url(link)
        # Strip query parameters for cleaner URLs
        resolved = resolved.split('?')[0]
        results.append({
            "id": f"{network}_{i}",
            "network": network,
            "media_url": resolved,
            "title": f"Video {i+1}",
            "summary": "",
            "bullets": []
        })

with open("new_trends.json", "w") as f:
    json.dump(results, f, indent=2)

print("Done generating new trends")
