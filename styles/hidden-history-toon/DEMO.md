# Hidden History Toon · demo film: *Ice in August*

One example among many. Don't reuse its story, arc, shots, props or timings.

28.3 s · 1080×1920 · 30 fps · `hidden-history-toon.mp4` · rebuild with `sh demo/build.sh` (writes to `demo/out/`, or `$OUT`)

## Story

A man saws a frozen lake into blocks and swears he'll sell the ice in August. The town laughs; a man in a top hat says it'll be soup by June. He stacks the ice in a wooden shed and buries it in sawdust. *Wait. Sawdust?* A crane down into a cut-away icehouse explains: sawdust is full of trapped air, and trapped air barely passes heat, so the sun cooks the walls while the cold stays inside. In August, with the town melting, he opens the door, and the first in line is the man who laughed when… (the cut runs straight back into the hook: "…he sliced a frozen lake into blocks").

Beat sheet used: hook → mockery (one quoted line) → the act → self-interruption twist + silence → "You see," → payoff → loop. No hero name, present-tense escalation compressed for a 28 s test.

## Shots

| # | Time | Words | Picture | Camera | Key |
|---|---|---|---|---|---|
| 1 | 0.00 | He sliced a frozen lake | hero sawing ice at frame 0 | low-angle fast push-in | lake |
| 2 | 1.12 | into blocks, and | cut grid, channel of floating blocks | pull-back reveal | lake |
| 3 | 2.28 | swore he'd sell it in August. | hero with ICE FOR SALE IN AUGUST board; grin snaps on "August" | push-in | lake |
| 4 | 4.03 | The whole town laughed at him. | townsfolk on the shore; laughs snap on "laughed" | whip-pan with motion blur | lake |
| 5 | 5.65 | Ice, in August? | the rival laughing, mouth driven by the voice | low-angle push | lake |
| 6 | 7.03 | It'll be soup by June! | a block melting in a bowl, calendar on JUNE 1806 | push-in | kitchen lamp |
| 7 | 8.65 | So he stacked it in a wooden shed, | a block lowered onto the stack | orbit | winter shed |
| 8 | 9.97 | and buried it in sawdust. | sawdust pouring from a bucket | tilt down following the pour | winter shed |
| 9 | 11.90 | Wait. Sawdust? | the sawdust mound and a block corner; **music cuts, wind only** | slow push | winter shed, desaturated |
| 10 | 13.68 | You see, sawdust is packed with tiny pockets of trapped air, | **cross-section dive**: roof → cut face; air pockets appear | crane down | hot cut-away |
| 11 | 16.86 | and trapped air barely passes heat. | heat arrows from the sun die in the sawdust | push | hot cut-away |
| 12 | 18.80 | The sun cooks the walls, | outer boards glow hot | wide, slow push | hot cut-away |
| 13 | 20.08 | but the cold stays locked inside. | ice beside the layered wall | push | hot cut-away |
| 14 | 22.18 | So in August, when the whole town was melting, | sweating townsfolk outside the icehouse | aerial descent (oblique) | **colour-key turn**: August street |
| 15 | 24.86 | he opened the door, | the door swings, god-ray floods in, hero smug | push (the style frame) | August interior |
| 16 | 25.84 | and the first in line was the man who laughed when | the queue; the rival snaps to sheepish on "laughed"; hard stop | push-in | August street |

Joins: 3-frame cross-dissolve centred on every cut, except shot 4 (whip-pan, 5 sub-frames averaged).

Every decision in `CHANGES.md` on screen: essence and captions (every shot), vertical size, card cast with rim light (1–5, 7–8, 14–16), painted ink-lined sets (all), one key per place and the colour-key turn (lake → kitchen → winter shed → hot cut-away → August), physical depth of field (all), ~2 s moving shots (all), narrator and bed (all), silence (9), cross-section dive (10–13), expression snap (3, 4, 16), loop ending (16 → 1).

## Palette (keys)

- Lake: sun #FFE9C9, sky #BCD6F0, fill sky #A9C4E8 / ground #EEF3FB.
- Winter shed: door light #D6E4FF, fill #5A6A8C / #2E2E38, fog #262A36.
- Cut-away: sun #FFCF7A, background #F2BD6C, outer boards glow #FF5A1A, heat arrows #FF6A1F.
- August street: sun #FFBF70, background #F5C27A. August interior: sun #FFD49A, fog #3B2A1E, god-ray #FFCF8A.
- Fixed: ink #2A1E18, head cream #F6EBDD, caption white.

## Score and sound

- Narrator Kokoro `am_michael` at 1.0–1.22 (about 3.6 words/s overall), the rival `bm_george`; laughs are four Kokoro voices saying "Ha ha ha!", mixed low.
- Bed (`mix.py`): F major, 120 bpm, I–V–vi–IV; contrabass and violin pizzicato oom-pah, staccato bassoon/clarinet line, woodblock; a falling bassoon figure on "laughed"; glockenspiel on "August", "air", "heat", "cold"; tuba and a rising violin line from "So in August"; hard cut to silence on "Wait." until "You see,"; hard stop on the last frame for the loop. About 16 dB under the voice by RMS; master −14.2 LUFS.
- Effects (all synthesized): saw rasps, whip whoosh, laughs, the block's thump, the sawdust hiss, wind in the silence, sizzle on "cooks", door creak and whoosh, coins.

## Build notes

- `build.sh`: TTS → whisper check (word timings) → laughs → `timeline.py` (line starts with breath gaps cut, one caption word per spoken word, the rival's mouth envelope) → `video.mjs` (4 workers, ~100 s on an M-series Mac) → `mix.py` → `mux.sh` → poster (t = 25.5, `?nocap`) and style frame (`?shot=frame`).
- Shots are a list of `{ t, f(t, u) }` in `main.js`: each sets its visible sets, its colour key (`setKey`), the cast's poses and expressions, the camera (`cam(p0, p1, look0, look1, eo(u))`, every move eased out) and the focus. Shot boundaries are word times, so a new voice re-times the film.
- Cards cast shadows through `alphaTest`; the rim light is a second texture made from the drawing itself (shifted copies) and added in the card's shader in the key's colour.
- Seen from inside the shed, the street outside glows (emissive) instead of being lit, so the doorway reads as a bright summer day whatever the sun's angle.
- Fix round after review (clipping, floating, flicker): the ice stack is now measured (3 × 5 × 3 blocks at .84 pitch, a packed-sawdust core box 5 cm inside the block faces, a .1 layer on each course, a half-dome bank on top kept clear of the front blocks); the hero lifts the block overhead and it appears in its slot on "shed"; he pours from a bucket while standing on two crates (shown only from the pour on), the stream running from the bucket's mouth (`card.point`) to the block's top; the floor ends at the back wall where the street begins; beams touch the ceiling; the door hinges in front of its jamb; a gable roof covers the whole shed; the lake's pines stand on a snow shore. Cards: feet on y = 0, a thickened shadow twin, a contact shadow behind the feet. Frames: 6 jittered sub-samples on the GPU (`?ss=` sets the count; `ss=1` for quick stills). Post: NaN/Inf guard.
- Pitfalls met here: a card seen from straight above looks like a cut-out lying down (aerials start oblique); a camera path through the far houses; far houses shading the street seen through the door; a sign drawn above the card's canvas gets clipped.

## Which file draws what

| File | Draws |
|---|---|
| `post.js` | 2× supersampled render, **ink outlines** (1/z Laplacian: silhouettes and creases, faded with distance), physical depth of field, bloom, grade (adapted from Tilt-Shift's `post.js`) |
| `world.js` | painted textures (`planks`, `sawdust`, `ice`, `plaster`, `signTex`, `bubbles`), `godRay`, `dust`, `fall` (snow, specks), the one-word `caption` |
| `cast.js` | the cast: `drawPerson` (head, face, expressions, body, limbs, hats, props), `makeCard` (camera-facing card, texture cache per pose, rim-light shader) |
| `main.js` | the five sets, the colour keys, the 16 shots, cross-dissolves and whip blur, captions from word timings |
| `timeline.py`, `mix.py` | timing data; score, effects, balance |
