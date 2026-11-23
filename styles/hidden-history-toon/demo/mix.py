# mix.py: score + sound effects + voice -> $OUT/mix.wav. Run from anywhere: LIB must point at the Lemo-Opuscar library.
# Score: a quirky bed in F major, 120 bpm (pizzicato oom-pah, staccato bassoon and clarinet, glockenspiel on the key words).
# It cuts to silence on "Wait." (one room sound stays), thins for the explanation, swells for August, and stops mid-phrase on "when" (the loop).
import os, sys, json
LIB = os.environ.get('LIB', os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, compress, noise, bp, lp, hp, env_exp, t_, thump, creak, whoosh, ding, norm

H = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get('OUT', os.path.join(H, '..', 'out')); os.makedirs(OUT, exist_ok=True)
TL = json.load(open(f'{H}/timeline.json')); DUR = TL['dur']
LINE = {l['id']: l['t'] for l in TL['lines']}
def WT(s, n=0): return [w[0] for w in TL['words'] if ''.join(c for c in w[1] if c.isalnum() or c == "'").lower() == s][n]
S.seed(3)

# —— score ——
B = .5                                   # one beat at 120 bpm
WAIT, EXPL, AUG = LINE['l5'], LINE['l6'], LINE['l8']
prog = [('F2', ['A3', 'C4', 'F4']), ('C2', ['G3', 'C4', 'E4']), ('D2', ['A3', 'D4', 'F4']), ('Bb1', ['Bb3', 'D4', 'F4'])]   # I V vi IV, one bar each
mel = ['C5', 'A4', 'F4', 'A4', 'G4', 'E4', 'C4', 'E4', 'F4', 'A4', 'D5', 'C5', 'Bb4', 'A4', 'G4', None]                      # bassoon/clarinet line, quavers per beat
ev = []
t, bar = 0.0, 0
while t < DUR - .05:
    root, ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * B
        if tb >= DUR - .05: break
        silent = WAIT <= tb < EXPL
        if silent: continue
        expl = EXPL <= tb < AUG; aug = tb >= AUG
        g = .55 if expl else (1.0 if not aug else 1.25)
        bass = root if b % 2 == 0 else S.name(S.midi(root) + 7)
        ev.append((tb, 'contrabass_pizz', bass, .4, .75, -.1, g))
        if b % 2 == 1: ev.append((tb, 'violins_pizz', ch[0], .3, .6, .25, g * .7)); ev.append((tb, 'violins_pizz', ch[2], .3, .55, .3, g * .7))
        if aug and b % 2 == 0: ev.append((tb, 'tuba_stac', S.name(S.midi(root) + 12), .35, .6, 0, .8))
        m = mel[(bar % 4) * 4 + b]
        if m and not expl: ev.append((tb + (B / 2 if b % 2 else 0), 'bassoon_stac' if bar % 2 == 0 else 'clarinet_stac', m if bar % 2 else S.name(S.midi(m) - 12), .25, .7, -.3, .8 * g))
        if expl and b == 0: ev.append((tb, 'clarinet', ch[1].replace('4', '5'), B * 3.6, .35, -.25, .5))
        ev.append((tb, 'woodblock', None, None, .35 if b % 2 else .5, .4, .25 * g))
    t += 4 * B; bar += 1
# the town laughs: a falling staccato bassoon figure; glockenspiel on the key words; a rising violin line into August
for i, p in enumerate(['A3', 'G#3', 'G3', 'F#3', 'F3']): ev.append((WT('laughed') + i * .11, 'bassoon_stac', p, .1, .8, -.3, 1.1))
for w in ['august', 'air', 'heat', 'cold']: ev.append((WT(w), 'glockenspiel', 'C6' if w != 'cold' else 'A5', 1.2, .55, .2, .9))
for i, p in enumerate(['C4', 'D4', 'E4', 'F4', 'G4', 'A4']): ev.append((AUG + i * .38, 'violins', p, .5, .5, .2, .55))
ev.append((WT('opened'), 'violins', 'C5', 1.6, .6, .2, .7)); ev.append((WT('opened'), 'glockenspiel', 'F6', 1.5, .6, .1, 1))
ev = [e for e in ev if e[0] < DUR - .02]
music = S.render(ev, dur=DUR + 1.5)[:int(DUR * SR)]
music = S.room(music, size=.35, mix=.14)
# hard cut into the silence (reverb tails too), and a hard stop at the end for the loop
music[int(WAIT * SR):int(EXPL * SR)] = 0
music[int((DUR - .03) * SR):] = 0

# —— voice ——
voice = np.zeros((int(DUR * SR), 2), np.float32)
for l in TL['lines']:
    x, sr = sf.read(f'{H}/audio/voice/{l["id"]}.wav', dtype='float32'); x = x if x.ndim == 1 else x.mean(1)
    x = resample_poly(x, SR, sr).astype(np.float32); x = compress(x / (np.abs(x).max() + 1e-9), thr=.3, ratio=3)
    add(voice, x, l['t'], .9 if l['id'] != 'l3' else .85, .0 if l['id'] != 'l3' else .12)

# —— sound effects, on the things the narration names ——
fx = np.zeros_like(voice)
def saw(d=1.1):   # ice saw: a rasp on each stroke (the picture saws at 9 rad/s ≈ 1.4 strokes/s, two rasps per stroke)
    x = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / .35) + 1):
        s = int(k * .35 * SR); n = bp(noise(.22), 1800, 5200) * np.sin(np.linspace(0, np.pi, int(.22 * SR))) ** 1.5
        n *= 1 + .5 * np.sin(t_(.22) * 2 * np.pi * 90); x[s:s + len(n)] += n[:len(x) - s]
    return norm(x, .5)
add(fx, saw(), 0, .55, .15)
add(fx, whoosh(.32, .9), LINE['l2'] - .02, .45, -.3)                          # whip-pan
for i in range(4):                                                             # the town laughs
    x, sr = sf.read(f'{H}/audio/laughs/h{i + 1}.wav', dtype='float32'); x = resample_poly(x, SR, sr).astype(np.float32)
    add(fx, x / (np.abs(x).max() + 1e-9), WT('laughed') + .05 + i * .07, .32, [-.5, .4, -.2, .6][i])
add(fx, thump(1.0, 90), LINE['l4'] + 1.1, .7, -.1)                             # the block lands on the stack
pourd = WT('sawdust') + .8 - WT('and', 1)                                      # sawdust pouring
p = lp(hp(noise(pourd), 900), 6000) * np.minimum(1, t_(pourd) / .2) * np.minimum(1, (pourd - t_(pourd)) / .3); add(fx, norm(p, .4), WT('and', 1), .35, -.2)
wd = EXPL - WAIT                                                               # the silence: only the wind outside
wind = lp(noise(wd + .4), 500) * (1 + .4 * np.sin(t_(wd + .4) * 2 * np.pi * .4)); add(fx, norm(wind, .25), WAIT, .5, .3)
for i in range(3): add(fx, norm(bp(noise(.5), 3000, 9000) * env_exp(.5, .12), .2), WT('cooks') + i * .25, .25, .5)   # sizzle on the hot boards
add(fx, creak(1.0), WT('opened') - .05, .7, .25); add(fx, whoosh(.6, .7), WT('opened') + .2, .35, .1)               # the door
for i in range(3): add(fx, ding(.6), WT('first') + .25 + i * .09, .18, .3)                                            # coins
fx[int((DUR - .03) * SR):] = 0

# —— balance: music about 16 dB under the voice by RMS while he speaks ——
rms = lambda x: np.sqrt(np.mean(x[np.abs(x).sum(1) > 1e-4] ** 2) + 1e-12)
music *= (rms(voice) / rms(music)) * 10 ** (-16 / 20)
mix = limit(voice + music + fx, .95)
sf.write(f'{OUT}/mix.wav', mix, SR)
sf.write(f'{OUT}/music.wav', music, SR)
print(f'{OUT}/mix.wav', round(DUR, 2), 's')
