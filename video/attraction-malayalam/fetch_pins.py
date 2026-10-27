"""Download Pinterest pin images into pins/<slot>.jpg so photo_card() uses them.

Usage: python3 fetch_pins.py pins.json
pins.json maps slot -> image URL (the "1200x" url from the Pinterest API via Zapier), e.g.
  {"gym": "https://i.pinimg.com/1200x/...jpg", "trek": "...", "food": "...", "rain": "...",
   "couple": "...", "cafe": "...", "cinema": "...", "chat": "..."}
Needs i.pinimg.com allowed in the environment's network settings.
"""
import json, os, sys, requests

slots = json.load(open(sys.argv[1]))
os.makedirs('pins', exist_ok=True)
for slot, url in slots.items():
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    with open(os.path.join('pins', slot + '.jpg'), 'wb') as f:
        f.write(r.content)
    print('saved', slot, len(r.content), 'bytes')
