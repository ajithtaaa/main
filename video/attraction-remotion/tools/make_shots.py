"""Build src/data/shots.json: one animated shot per caption line (timing from timing.json)."""
import json
FPS = 30
T = json.load(open('src/data/timing.json'))
SCN = {'hook': 0, 'tease': 1, 'arjun': 2, 'reject': 3, 'mistake': 4, 'six': 5, 'p1': 6, 'p2': 7, 'p3': 8, 'comment': 9,
       'p4': 10, 'p5': 11, 'p6': 12, 'secret': 13, 'after': 14, 'outro': 15}
S = [
 # hook
 ('people', {'mode': 'love', 'title': 'ഭ്രാന്തമായി ആഗ്രഹിക്കാൻ?'}),
 ('cross', {'items': [{'icon': 'glasses', 'label': 'സൗന്ദര്യം'}], 'mark': 'x'}),
 ('cross', {'items': [{'icon': 'money', 'label': 'പണം'}], 'mark': 'x'}),
 # tease
 ('lock', {'title': 'രഹസ്യം', 'open': False}),
 ('slam', {'lines': ['നോക്കുന്ന രീതി', 'തന്നെ മാറും'], 'icon': 'eye'}),
 ('slam', {'lines': ['SKIP', 'ചെയ്യരുത്!'], 'icon': 'x', 'shake': 1}),
 # arjun
 ('slam', {'lines': ['ആദ്യം', 'ഒരു കഥ'], 'icon': 'book'}),
 ('idcard', {'name': 'അർജുൻ', 'age': ''}),
 ('number', {'n': 26, 'title': 'വയസ്സ്', 'count': True}),
 ('people', {'mode': 'crush', 'title': 'ഭയങ്കര ഇഷ്ടം'}),
 ('checks', {'items': ['ചോദിച്ചതെല്ലാം', 'ചെയ്തുകൊടുക്കും'], 'icon': 'gift'}),
 ('chat', {'clock': '2:00', 'msgs': ['ഹായ്', 'ഉറങ്ങിയില്ലേ?', 'ഇല്ല!', 'ഓക്കെ', 'ശരി ശരി']}),
 ('chat', {'fast': True, 'msgs': ['ഓക്കെ!', 'ശരി!', 'ഉടൻ!', 'ഓക്കെ!', 'ശരി!', 'ഉടൻ!'], 'title': 'ഉടൻ മറുപടി'}),
 # reject
 ('people', {'mode': 'her', 'title': 'ഒരു ദിവസം...'}),
 ('quote', {'text': 'നീ നല്ലവനാണ്... പക്ഷേ എനിക്ക് അങ്ങനെയൊരു ഫീലിംഗ് ഇല്ല.', 'break': True}),
 ('slam', {'lines': ['എന്താണ്', 'തെറ്റിയത്?'], 'icon': 'question', 'shake': 1}),
 ('slam', {'lines': ['അവൻ', 'എന്ത് മാറ്റി?'], 'icon': 'question'}),
 ('slam', {'lines': ['ഈ വീഡിയോയിൽ', 'തന്നെ'], 'icon': 'play'}),
 # mistake
 ('slam', {'lines': ['മിക്കവരും ചെയ്യുന്ന', 'തെറ്റ്'], 'icon': 'warn', 'shake': 1}),
 ('orbit', {'title': 'അവൾ = കേന്ദ്രം', 'fall': False}),
 ('orbit', {'title': 'അവന്റെ ലോകം', 'fall': True}),
 ('empty', {'title': 'ബാക്കി ഒന്നുമില്ല'}),
 ('mystery', {'title': 'മിസ്റ്ററി'}),
 ('depth', {'title': 'ആഴം'}),
 # six
 ('grid6', {'highlight': None, 'title': '6 കാര്യങ്ങൾ'}),
 ('grid6', {'highlight': 4, 'title': 'മിക്കവർക്കും അറിയില്ല'}),
 # p1
 ('number', {'n': 1, 'title': ''}),
 ('slam', {'lines': ['സ്വന്തമായി', 'ഒരു മിഷൻ'], 'icon': 'target'}),
 ('icons4', {'items': [{'icon': 'dumbbell', 'label': 'ജിം', 'media': 'gym'}, {'icon': 'briefcase', 'label': 'കരിയർ'}, {'icon': 'chart', 'label': 'ബിസിനസ്'}, {'icon': 'music', 'label': 'മ്യൂസിക്'}]}),
 ('fireeye', {'title': 'കണ്ണുകളിൽ ഒരു തീ'}),
 ('people', {'mode': 'notice', 'title': 'അവൾ ശ്രദ്ധിക്കും'}),
 ('portal', {'title': 'നിന്റെ ലോകത്തിലേക്ക്'}),
 ('run', {'mode': 'chase', 'title': 'പിന്നാലെ ഓടുന്നില്ല'}),
 ('run', {'mode': 'forward', 'title': 'മുന്നോട്ട്!'}),
 # p2
 ('number', {'n': 2, 'title': ''}),
 ('listen', {'title': 'ശരിക്കും കേൾക്കുക'}),
 ('versus', {'left': 'മറുപടി പറയാൻ', 'right': 'മനസ്സിലാക്കാൻ', 'win': 'right', 'step': 0}),
 ('versus', {'left': 'മറുപടി പറയാൻ', 'right': 'മനസ്സിലാക്കാൻ', 'win': 'right', 'step': 1}),
 ('calendar', {'n': 3, 'title': 'ദിവസം മുൻപ്'}),
 ('quote', {'text': 'അമ്മയുടെ ഡോക്ടർ അപ്പോയിന്റ്മെന്റ് എന്തായി?', 'chat': True}),
 ('smile', {'title': 'മുഖത്ത് ഒരു മാറ്റം'}),
 ('crowd', {'title': 'ആരും ശ്രദ്ധിക്കുന്നില്ല', 'spot': False}),
 ('crowd', {'title': 'നീ വ്യത്യസ്തൻ', 'spot': True}),
 # p3
 ('number', {'n': 3, 'title': ''}),
 ('slam', {'lines': ['പുതിയ അനുഭവങ്ങൾ', 'ഒരുമിച്ച്'], 'icon': 'spark'}),
 ('study', {'title': 'സൈക്കോളജി പഠനം'}),
 ('chart', {'title': 'അടുപ്പം', 'up': True}),
 ('cross', {'items': [{'icon': 'coffee', 'label': 'ഒരേ കഫേ'}, {'icon': 'film', 'label': 'ഒരേ സിനിമ'}, {'icon': 'chat', 'label': 'ഒരേ ചാറ്റ്'}], 'mark': 'none'}),
 ('slam', {'lines': ['ബോർ!'], 'icon': 'sleep', 'shake': 1, 'grey': True}),
 ('media', {'key': 'trek', 'title': 'സൺറൈസ് ട്രെക്ക്'}),
 ('media', {'key': 'food', 'title': 'ഫുഡ് സ്ട്രീറ്റ്'}),
 ('media', {'key': 'rain', 'title': 'മഴയത്ത് ബൈക്ക്'}),
 ('memories', {'title': 'ഓർമ്മകൾ = നിന്റെ മുഖം'}),
 # comment
 ('slam', {'lines': ['ഏതാണ് നീ', 'ചെയ്യാത്തത്?'], 'icon': 'question'}),
 ('comment', {'text': '1, 2, 3...'}),
 ('number', {'n': 4, 'title': '?', 'tease': True}),
 # p4
 ('number', {'n': 4, 'title': ''}),
 ('shield', {'title': 'ഇമോഷണൽ സേഫ്റ്റി'}),
 ('slam', {'lines': ['ഇന്റർനെറ്റ്', 'ടിപ്സ്'], 'icon': 'globe'}),
 ('cross', {'items': [{'icon': 'ignore', 'label': 'അവഗണിക്കൂ'}, {'icon': 'jealous', 'label': 'ജെലസി'}, {'icon': 'game', 'label': 'ഗെയിം'}], 'mark': 'x'}),
 ('chart', {'title': 'കുറച്ചുകാലം', 'spike': True}),
 ('versus', {'left': 'ആകാംക്ഷ', 'right': 'സ്നേഹം', 'win': 'left', 'step': 1, 'flip': True}),
 ('slam', {'lines': ['ശരിയായ', 'വഴി'], 'icon': 'check', 'shake': 1}),
 ('equals', {'left': 'വാക്ക്', 'right': 'പ്രവൃത്തി'}),
 ('clock', {'title': 'പറഞ്ഞ സമയത്ത്'}),
 ('calm', {'title': 'ദേഷ്യത്തിലും ബഹുമാനം'}),
 ('home', {'title': 'അവൾ അവളായിരിക്കാം'}),
 ('home', {'title': 'വിട്ടുപോകില്ല', 'heart': True}),
 # p5
 ('number', {'n': 5, 'title': ''}),
 ('slam', {'lines': ['ശാന്തമായ', 'കോൺഫിഡൻസ്'], 'icon': 'calm'}),
 ('volume', {'title': 'ഉറക്കെ അല്ല'}),
 ('bubble', {'text': 'അറിയില്ല', 'col': 'teal'}),
 ('bubble', {'text': 'സോറി', 'col': 'pink'}),
 ('bubble', {'text': 'എന്റെ അഭിപ്രായം', 'col': 'orange', 'brave': True}),
 ('respect', {'title': 'ആഴത്തിലുള്ള ബഹുമാനം'}),
 # p6
 ('number', {'n': 6, 'title': ''}),
 ('fan', {'title': 'അവളുടെ സ്വപ്നങ്ങളുടെ ഫാൻ'}),
 ('dream', {'title': 'പുതിയ തുടക്കം'}),
 ('naysay', {'title': 'നടക്കില്ല'}),
 ('people', {'mode': 'support', 'title': 'നീ മാത്രം'}),
 ('quote', {'text': 'നിനക്ക് പറ്റും. ഞാനുണ്ട് കൂടെ.', 'gold': True}),
 # secret
 ('lock', {'title': 'രഹസ്യം', 'open': True}),
 ('slam', {'lines': ['അവൾ ആഗ്രഹിക്കുന്നത്'], 'icon': 'heart'}),
 ('versus', {'left': 'അവൻ എങ്ങനെ', 'right': 'അവൾ എങ്ങനെ', 'win': 'right', 'step': 0}),
 ('mirror', {'title': 'അവൾ സ്വയം എങ്ങനെ കാണുന്നു'}),
 ('words3', {'words': ['സുന്ദരി'], 'n': 1}),
 ('words3', {'words': ['സുന്ദരി', 'ബുദ്ധിമതി'], 'n': 2}),
 ('words3', {'words': ['സുന്ദരി', 'ബുദ്ധിമതി', 'സുരക്ഷിത'], 'n': 3}),
 ('slam', {'lines': ['മറ്റാരിൽ നിന്നും', 'കിട്ടില്ല'], 'icon': 'heart', 'shake': 1}),
 # after
 ('idcard', {'name': 'അർജുൻ', 'age': '2.0', 'upgrade': True}),
 ('icons4', {'items': [{'icon': 'dumbbell', 'label': 'ജിം'}], 'check': True}),
 ('icons4', {'items': [{'icon': 'dumbbell', 'label': 'ജിം'}, {'icon': 'briefcase', 'label': 'ബിസിനസ്'}], 'check': True}),
 ('icons4', {'items': [{'icon': 'dumbbell', 'label': 'ജിം'}, {'icon': 'briefcase', 'label': 'ബിസിനസ്'}, {'icon': 'ear', 'label': 'കേൾക്കാൻ'}], 'check': True}),
 ('calendar', {'n': 365, 'title': 'ഒരു വർഷം', 'flip': True}),
 ('media', {'key': 'couple', 'title': 'ഇന്ന്'}),
 ('quote', {'text': 'അവന്റെ കൂടെയിരിക്കുമ്പോൾ എനിക്ക് ഞാനായിരിക്കാം.', 'love': True}),
 # outro
 ('share', {'title': 'സുഹൃത്തിന് അയക്കൂ'}),
 ('next', {'n': 7, 'title': 'സൂചനകൾ', 'sub': 'അവൾക്ക് താൽപ്പര്യമുണ്ടോ?'}),
 ('subscribe', {}),
 ('slam', {'lines': ['കാണാം!'], 'icon': 'wave', 'end': True}),
]
assert len(S) == len(T), (len(S), len(T))
shots = []
end_all = 233.95 + 1.6
for i, (c, (tpl, props)) in enumerate(zip(T, S)):
    st = c['start'] - 0.12 if i else 0
    en = T[i + 1]['start'] - 0.12 if i + 1 < len(T) else end_all
    shots.append({'id': i, 'scene': SCN[c['scene']], 'from': round(st * FPS), 'to': round(en * FPS),
                  'tpl': tpl, 'props': props, 'text': c['text'], 'cs': round(c['start'] * FPS), 'ce': round(c['end'] * FPS)})
json.dump(shots, open('src/data/shots.json', 'w'), ensure_ascii=False, indent=0)
print(len(shots), 'shots; total frames', round(end_all * FPS))
