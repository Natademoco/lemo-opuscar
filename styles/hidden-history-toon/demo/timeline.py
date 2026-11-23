# timeline.py: line start times and one caption word per spoken word -> timeline.json (read by main.js and mix.py)
import json, os
H = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{H}/lines.json')); D = json.load(open(f'{H}/audio/voice/dur.json')); WD = json.load(open(f'{H}/audio/voice/words.json'))
GAP = {'l2': .08, 'l3': .1, 'l4': .12, 'l5': .1, 'l6': .7, 'l7': .1, 'l8': .12, 'l9': .05}   # pause before each line; .7 s = the silence after "Wait. Sawdust?"
t, lines, words = 0.0, [], []
for l in L:
    t += GAP.get(l['id'], 0)
    lines.append({'id': l['id'], 't': round(t, 3), 'dur': D[l['id']]})
    sw, ww = l['text'].split(), WD[l['id']]
    assert len(sw) == len(ww), (l['id'], sw, ww)   # asr_check passed word for word, so counts match
    for s, (_, a, b) in zip(sw, ww):
        words.append([round(t + max(a, 0), 3), s])
    t += D[l['id']]
json.dump({'dur': round(t + .05, 3), 'lines': lines, 'words': words}, open(f'{H}/timeline.json', 'w'))
print(round(t, 2)); [print(f'{w[0]:6.2f} {w[1]}') for w in words]

# mouth envelope for the quoted line (l3): RMS at 30 Hz, normalised
import wave, array
wv = wave.open(f'{H}/audio/voice/l3.wav'); sr = wv.getframerate(); a = array.array('h', wv.readframes(wv.getnframes()))
hop = sr // 30; env = [(sum(x * x for x in a[i:i + hop]) / hop) ** .5 for i in range(0, len(a) - hop, hop)]
mx = max(env); T = json.load(open(f'{H}/timeline.json')); T['env3'] = [round(e / mx, 2) for e in env]
json.dump(T, open(f'{H}/timeline.json', 'w'))
