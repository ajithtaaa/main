"""Generate one Veo background clip per story section with the Gemini API.

Needs GEMINI_API_KEY in the environment. Writes public/veo/scene<k>.mp4, looped/trimmed with
ffmpeg to the exact length of that section, then refreshes src/data/media.json.

  python3 tools/veo_scenes.py               # all 16 sections
  python3 tools/veo_scenes.py 0 6 8         # only some sections
  python3 tools/veo_scenes.py --list-models # show which Veo models the key can use
"""
import json, os, subprocess, sys, time
import requests

API = 'https://generativelanguage.googleapis.com/v1beta'
KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
STYLE = ('Vox explainer style mixed-media paper collage animation, cut-paper characters with white borders, halftone dot textures, '
         'torn paper edges, flat drop shadows, smooth parallax camera movement, vibrant, cinematic lighting, no text, no letters, no captions')
PROMPTS = [
    'a young Indian man and woman as paper cutouts facing each other, a red paper heart pulsing between them, warm red and purple palette',
    'a glowing golden padlock floating on a dark navy background, light rays and dust particles, slow push in',
    'a young Indian man in his twenties texting on his phone late at night in a cozy room lit by a lamp, a wall clock showing 2 AM',
    'a red paper heart cracking into two halves on a grey rainy background, melancholic slow motion',
    'a woman paper cutout at the center while a man\'s world of gym, music and work objects orbits around her and then falls away, teal palette',
    'colorful paper tiles flipping in sequence on a bright yellow background, playful kinetic motion',
    'a determined young Indian man running forward on a road at sunrise, sparks of fire in his eyes, orange and magenta palette',
    'a young Indian man attentively listening to a woman talking in a cafe, sound waves drawn as paper ripples, teal palette',
    'a young couple trekking up a mountain at sunrise, then riding a motorbike together in the Kerala rain, pink and purple palette',
    'blue paper speech bubbles and abstract shapes floating playfully',
    'a warm glowing house at night as a safe space, a relaxed woman smiling inside, deep navy and crimson palette',
    'a calm confident man standing still while noisy chaos swirls around him, purple palette',
    'a man cheering for a woman standing on a spotlight stage, confetti falling, amber palette',
    'a woman looking into an ornate mirror and seeing a glowing confident version of herself, magical sparkles, deep purple',
    'a happy young Indian couple laughing together at golden hour on a Kerala beach, warm peach palette',
    'red paper confetti and shapes bursting outward in celebration, abstract',
]

def get(url, **kw):
    r = requests.get(url, params={'key': KEY}, timeout=60, **kw); r.raise_for_status(); return r

def pick_model():
    models = get(f'{API}/models', ).json().get('models', [])
    veo = [m['name'] for m in models if 'veo' in m['name'] and 'predictLongRunning' in m.get('supportedGenerationMethods', [])]
    if not veo: sys.exit('No Veo model available for this key: ' + ', '.join(m['name'] for m in models))
    fast = [m for m in veo if 'fast' in m]
    return sorted(fast or veo)[-1]

def scene_lengths():
    shots = json.load(open('src/data/shots.json'))
    starts = {}
    for s in shots: starts.setdefault(s['scene'], s['from'])
    keys = sorted(starts)
    end = shots[-1]['to']
    return {k: ((starts[keys[i + 1]] if i + 1 < len(keys) else end) - starts[k] + 12) / 30 for i, k in enumerate(keys)}

def generate(model, k, prompt):
    body = {'instances': [{'prompt': f'{prompt}. {STYLE}'}],
            'parameters': {'aspectRatio': '16:9', 'negativePrompt': 'text, letters, words, subtitles, watermark, logo, distorted faces'}}
    r = requests.post(f'{API}/{model}:predictLongRunning', params={'key': KEY}, json=body, timeout=60)
    r.raise_for_status(); op = r.json()['name']
    while True:
        time.sleep(10)
        st = get(f'{API}/{op}').json()
        if st.get('done'):
            if 'error' in st: raise RuntimeError(st['error'])
            resp = st['response']
            samples = (resp.get('generateVideoResponse') or resp).get('generatedSamples') or resp.get('generatedVideos')
            return samples[0]['video']['uri']

def main():
    if not KEY: sys.exit('Set GEMINI_API_KEY first.')
    if '--list-models' in sys.argv:
        print(pick_model()); return
    model = pick_model(); print('model', model)
    want = [int(a) for a in sys.argv[1:]] or list(range(len(PROMPTS)))
    lens = scene_lengths()
    os.makedirs('public/veo', exist_ok=True); os.makedirs('out/veo_raw', exist_ok=True)
    for k in want:
        raw = f'out/veo_raw/scene{k}.mp4'
        if not os.path.exists(raw):
            print('scene', k, 'generating...'); uri = generate(model, k, PROMPTS[k])
            r = requests.get(uri, params={'key': KEY}, timeout=300, allow_redirects=True); r.raise_for_status()
            open(raw, 'wb').write(r.content)
        # loop (ping-pong feel via reverse) and fit to the section length, 1920x1080 30fps
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-filter_complex',
                        '[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,loop=loop=-1:size=32767[v]',
                        '-map', '[v]', '-t', f'{lens[k]:.2f}', '-an', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', f'public/veo/scene{k}.mp4'], check=True)
        print('scene', k, 'ready', f'{lens[k]:.1f}s')
    subprocess.run([sys.executable, 'tools/media_manifest.py'], check=True)

if __name__ == '__main__':
    main()
