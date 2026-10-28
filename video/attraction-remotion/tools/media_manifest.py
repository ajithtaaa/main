"""List available Veo clips (public/veo/<shotId>.mp4) and Pinterest photos (public/pins/<slot>.jpg) for the renderer."""
import json, os
d = {'veo': sorted(f for f in os.listdir('public/veo') if f.endswith('.mp4')),
     'pins': sorted(f for f in os.listdir('public/pins') if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))}
json.dump(d, open('src/data/media.json', 'w'), indent=1)
print(d)
