# Hidden History Toon · 冷知识卡通 — Style Prompt

Made from a blank page; techniques from Tilt-Shift Miniature (`tilt-shift`), with ideas from Memphis Diorama and Sci-Fi Sitcom Toon.
Default size: 1080×1920, 30 fps.

> A strange true story told fast by one narrator, as a chain of two-second moving shots through a lit, ink-outlined 3D cartoon world: every noun is on screen the moment it is spoken, one word of caption at a time, and the reason for the strange act is held back until the end.
> References (grammar only): animated "hidden history / weird science" Shorts on vertical video platforms (one narrator, rich 3D sets, a flat 2D cartoon cast, one-word captions); comic-book inking over 3D (contour lines on lit forms); museum cutaway diagrams. Copy none of their characters, stories, sets, music or channel names, and never name them in a film.

## 1. Essence, and what it is not

- **A picture on every word.** Each clause of narration gets its own literal image: when the narrator says "fired", a hand hovers over a FIRE button; when he says "pink", a wall turns pink. A sentence without a new picture is cut from the script, not covered by a held shot.
- **A real 3D world, inked.** Sets are modelled in chunky 3D, lit by one motivated light and drawn over with dark ink contours, so the film reads as a comic you can fly through. Camera moves show true parallax.
- **A flat cartoon cast inside the light.** People are 2D drawings (thick outline, cream oval head, dot eyes, big brows, tube body, stick limbs) standing in the 3D set on camera-facing cards, tinted by the scene's key light and casting real shadows.
- **The camera never stops.** About two seconds per shot; each shot opens moving and eases out; shots join by a 3-frame dissolve or a whip-pan. Frame 0 already shows the strange act.
- **One word of caption at a time**, white heavy sans, cut on its syllable.

Not a flat 2D explainer (no flat backgrounds, no slides: the world has depth and parallax), not a plain game render (ink lines, painted textures, a drawn cast), not a slideshow or talking head (no held stills, no title cards, no host), not a toon-shaded 3D character film (the people are drawings, not models).

## 2. Materials & rendering

- **Sets** (rule): chunky, slightly oversized primitives (boxes with bevels, lathed cylinders, extruded profiles); props 20–40 % bigger than real so they read on a phone. Every surface gets a **painted texture made in code** on a canvas: wood planks with grain and dark seams, brick with mortar, plaster with mottling, fabric and rug patterns, metal with a soft streak. Textures are bold and low-detail, like a painted background, never photographic.
- **Ink outlines** (rule): one post pass finds edges in depth (where 1/z stops being linear: silhouettes and creases) and draws them in one warm near-black ink (about #2A1E18), 2–3 px at 1080 wide, fading with distance so far detail doesn't turn to scribble. Outlines are drawn before depth of field, so they blur with the set.
- **Light** (rule): one **motivated key light per place**, visible or implied in frame (bare bulb, lantern, neon sign, moon, low sun through a door), with soft shadows; a coloured hemisphere fill so shadows keep a hue; light fog for depth. **God-rays** are additive light shafts (soft-edged cones or slabs with a falloff shader) wherever the key passes through a gap. Practical lights glow with a gentle bloom.
- **Lens**: physical depth of field, focus on the subject's face or the named object; aperture widest in close-ups, least in wides. No screen-space blur band.
- **The cast** (rule): drawn in Canvas2D onto a texture per pose and expression, mapped onto a camera-facing card (yaw only) with alpha cut-out, so it casts a shadow from the key light and takes the key's colour. Outline about 7 px at full-body size in a 1080 frame, constant in screen space. Head: a cream oval (#F6EBDD) wider than the body, a 2D face (dot eyes, thick brows, a wide mouth with teeth when open, a small nose line), a soft shade crescent on the side away from the key. **Rim light** (rule): a band of the key's colour just inside the ink line on every edge that faces the key (head, body, limbs, hat), strongest when the key is behind the character. Body: a short tube in one solid colour with a darker side; stick limbs (≈ 6 px ink lines) with small round hands and shoes. Identity comes from one prop or costume (chef hat, flat cap, police cap, top hat, prison stripes, a hairstyle). Views: front, 3/4 and side, chosen by the camera angle. **Grounding** (rule): the drawn shoes sit exactly on the card's base line (y = 0); a hidden twin of the card with its alpha thickened by ~9 px casts the shadow (stick legs alone cast almost nothing, so the shadow seems to start at the body and the character floats); a soft contact shadow lies on the ground just behind the feet.
- **Explainers live in the world**: cross-sections (soil layers over a coffin, the wall of a building opened up), an x-ray body with a glowing organ, a chart standing as a sign, a corkboard with string, labelled objects. They are modelled and lit like the rest of the set.
- **Anti-aliasing** (rule): supersample 2× inside the post pass, and build every delivered frame from 6 samples jittered by a fraction of a pixel and spread over a half-frame shutter (2.4 frames on a whip-pan), summed in a half-float buffer on the GPU. Thin ink lines, snow, sawdust and fine textures don't shimmer, and fast moves get a touch of motion blur.
- **Props are measured, never eyeballed** (rule): every stacked or resting thing is placed from the dimensions of what it sits on (block on layer, layer on course, heap on block, crate beside stack); heaps are half-domes that stop at the surface; nothing interpenetrates another object, a wall, a floor or a frame.

## 3. Colour logic

- **One colour key per place**: the key light's hue and the set's dominant colours (warm amber bulb in a dark wood room; cold moon blue on snow; magenta-violet neon in a wet alley; clean noon sky on green grass). A film moves through **3–5 keys**, and the key changes when the story turns.
- Inside a key, saturation is high but values are ordered: the subject is the lightest or most saturated thing in frame, the background darker and cooler.
- **Fixed across every key**: the ink colour, the caption white, the cream of the heads (tinted only by the light, never repainted).
- One colour may belong to the story (the pink of a cell, the gold of the oil) and appears nowhere else at that strength.
- Example keys: storm sea (navy #1C2C6B, foam #DCEBFF, lantern #FFB54A); icehouse interior (umber #3A2618, door light #FFD9A0, ice #BFE7F2); August street (ochre #E9A23B, sky #6FB7E8, brick #B4523A).

## 4. Type & subtitles

- **Caption** (rule): one word at a time; two or three only for short pairs ("a frog's", "the emperor"). Montserrat Black (OFL), sentence case, white #FFFFFF, a thin black outline (about 5 px at 1080 wide) and a soft drop shadow (black at 35 %, 6 px blur, 3 px down). No box, no highlight colour. About 66 px font size at 1080 wide (a word like "sawdust." spans about 30 % of the frame width, as measured on the reference), centred horizontally at **65 % of frame height**, below the faces and clear of the platform UI at the bottom.
- The word **cuts in on its first syllable** and cuts out when the next word starts (word timestamps from the voice check); no fade, pop or bounce. Numbers are written as digits in the caption, as words in the TTS text.
- The only other text is **diegetic**: signs, labels, buttons and tins in the world (FIRE, STORM OIL, PRIZE HALL), modelled into the set in a period-appropriate face. No title card, no lower thirds, no end card, no call to action.
- Captions are the subtitles: no separate subtitle track is burned in. readcheck marks caption words `pass: true` (they are read with the voice, not in isolation).

## 5. Motion quality

- **Every shot opens moving** fast and eases out (ease-out cubic or expo over the shot), so the cut always lands on motion and the shot settles just before the next cut.
- **Characters move smoothly at 30 fps**: walk, lean, point, recoil, with anticipation before big actions and a short overshoot settle. Idle life: a slow breath (±1 % scale), a blink every 2–4 s.
- **Expressions snap**: a face changes to the next extreme in one frame, exactly on the word that causes it (smug, shocked, crying-laughing, furious, scared, satisfied). No in-betweens between expressions.
- **Mouths** open and close from the narration's loudness only on a character who is speaking a quoted line; the narrator has no body.
- Liquids, sparks, snow, rain and dust are small instanced particles in the 3D world, lit by the key.
- One cartoon exaggeration per film (a face literally turning purple, an ejector seat) is drawn as straight as everything else.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | What it expresses | Can serve |
|---|---|---|
| Fast push-in that eases to a stop on the named object | "this thing" | the hook object; a button; a strange tool |
| Pull-back reveal | the scale or the absurdity of the act | a bent rail; a huge crowd; the whole contraption |
| Crane down through a surface into a cross-section | going underneath the explanation | the reveal; a buried thing; inside a machine or a body |
| Tilt following a moving thing | cause flowing to effect | oil to the sea; a ball dropping; a signal travelling |
| Whip-pan with motion blur | a jump in place, or a sharp turn | "Meanwhile"; the rival; a twist |
| Low-angle push on a character | stubbornness, power | the hero holding firm; an authority mocking |
| Reaction close-up, slow push | the laugh or the doubt on a face | after every absurd picture |
| Orbit around the hero and the object | the plan in one image | the setup; the moment before the payoff |
| Aerial descent onto a place | arriving somewhere new | a new city; a new season; the colour-key turn |

Framing: subjects in the upper two-thirds; nothing important in the caption band (60–70 % height) or the bottom 12 % (platform UI). Transitions: 3-frame cross-dissolve by default, whip-pan on big moments; no hard cuts except into a silence.

## 7. Sound palette

- **Voice is the spine**: one male narrator, quick, dry and a little amused, like a friend telling a story at a bar; 3.6–4.0 words per second, breath gaps cut so the next sentence starts as the picture changes. Default: Kokoro TTS (an `am_` voice) at about 1.1× speed; the user's recording or another voice replaces it. Quoted lines from characters get a light character voice (a second TTS voice or the same one pitched). Verify every line with whisper; spell numbers in the TTS text and put digits in `asr`.
- **Music bed**: a light, quirky underscore (pizzicato strings, bassoon and clarinet, a little glockenspiel, woodblock) about 16 dB under the voice by RMS; it thins for the explanation and rises for the payoff. Never competes with words.
- **Sound effects**: 3–6 per film on the exact things the narration names (clang, splash, bell, crash, saw, laugh), synced to the picture frame of contact.
- **Silence**: one real silence per film, under the twist ("Wait, what?"): music cuts, one room sound stays.
- Mix: compress the voice, keep the bed about 16 dB under it by RMS, master −14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **The cross-section dive.** The camera cranes down through the ground, a wall or a body into a cut-away diagram built into the world, and the "You see," explanation plays inside it. *Fits content like:* soil layers over a buried bell rope; sawdust packed in an icehouse wall; the gap in an expanding rail.
- **The expression snap.** A face jumps to a new extreme exactly on the word that causes it. *Fits content like:* a boss's smug grin on "fired"; a crowd going from laughing to horrified; a guard's jaw dropping on "pink".
- **The colour-key turn.** When the story turns, the light changes with it: sunny to storm, warm kitchen to cold night, grey cell to pink. *Fits content like:* a storm rolling in mid-chase; winter cut to August; the moment a plan starts working.
- **The loop ending.** The last line stops mid-sentence on the payoff image, so the replay runs straight into the hook at frame 0. *Fits content like:* "...and the wave drops straight onto the pirates'"; a bell ringing as the film restarts on the bell.

## 9. Pitfalls of the medium

- A clause with no picture → the viewer swipes. Rewrite the line or give it an insert; never hold the previous shot over it.
- Caption over a face → keep heads above 58 % of frame height in every shot; check with a caption-band overlay on review stills.
- Card characters seen from high above look like cut-outs lying on the ground → keep the camera pitch under ~50° whenever a card is in frame; aerials start oblique, not top-down.
- A character floats → its feet are above the card's base, or its shadow begins at the body; ground every card (§2) and light exterior scenes from the camera's side, so shadows fall behind the characters.
- Objects pass through each other (ice into the sawdust layer, a heap through a block, a pour falling through the block it should land on, a door cutting its frame) → compute positions from the parts' dimensions; check a still of every shot for overlaps before the full render.
- Two surfaces at almost the same height flicker (a street plane under a shed floor) → end one where the other begins; never stack coplanar ground planes.
- A dark or black rectangle appears in the averaged picture → one NaN/Inf pixel spread by depth of field and bloom; sanitise colour in the post pass and ramp the aperture instead of switching it.
- A prop held in a drawn hand must meet the 3D world (a bucket pouring onto a block) → read the prop's point from the drawing (`card.point`) and start the 3D effect there.
- Card characters seen edge-on → never let the camera orbit more than ~35° from the card's facing without switching to the side view; yaw the card to the camera every frame.
- A card's shadow looks like a flat sheet → keep the key light within ~45° of the camera axis, or swap in a shadow-only proxy (a capsule) that casts instead of the card.
- Ink outlines crawl on fine geometry → keep geometry chunky, fade outlines with distance, supersample 2×.
- Painted textures read as noise at phone size → large shapes and two or three tones per texture; test a still at 360 px wide.
- Everything lit evenly → the place loses its key; one light must dominate (fill ≤ 30 % of key).
- God-rays wash out the picture → additive, low opacity, never in front of a face.
- Depth of field blurs the named object in a wide → focus is always on the thing being spoken.
- Fast TTS slurs numbers and names → check every line with whisper and respell.
- Shots over ~3 s feel dead in this grammar → split them, or keep the camera moving through the whole shot.

## 10. Engine

The style's own code, in `demo/` (copy what you need into the film's project folder; never build inside `styles/`):

- `demo/post.js`: 2× supersampled render, **ink outlines** from the 1/z Laplacian (silhouettes and creases; `dof.ink = { col, amt, r, k, far }`), physical depth of field (`dof.focus`, `dof.aper`, `dof.maxCoc`), bloom, grade.
- `demo/world.js`: painted textures made in code (`planks`, `sawdust`, `ice`, `plaster`, `signTex`, `bubbles`), `godRay` (additive tapered shaft), `dust` (floating motes), `fall` (snow, specks), `caption(g, word)` (the one-word caption, returns its box).
- `demo/cast.js`: the cast. `drawPerson(g, o)` draws a character into a 640×1280 canvas (`expr`: neutral, smug, laugh, talk, shocked, furious, grin, hot, sheepish, worried; `hat`, `hair`, `body`, `arms: { l: [angle, length], r: … }`, `prop`: tongs, saw, sign, coins, fan, block; `keyDir` ±1 = the side the key comes from). `makeCard(scene, o)` makes a camera-facing card with a texture cache per pose (an expression change is a texture swap) and the rim-light shader; `card.face(camera, tint, k, rimColour, rimK)` every frame. Each card carries its shadow twin and `card.contact` (the contact shadow; scale it down on a small top like a crate); `card.point(camera, x, y)` returns a point of the drawing in world space, and `card.anchor` is the pouring mouth of the `bucket` prop. Props also include `bucket` and `blockUp`.
- `demo/main.js`: how a film is put together: sets as groups shown per shot, colour keys (`setKey`), shots as `{ t, f(t, u) }` timed to word timestamps, the GPU sample accumulation (anti-aliasing, motion blur, cross-dissolves as weights), captions from `timeline.json`.
- `demo/timeline.py`, `demo/mix.py`, `demo/build.sh`: timing from the voice check, score and effects, the one-command build.

Techniques underneath: `../tilt-shift/demo/post.js` (the depth of field and grade this post pass grew from) and `../tilt-shift/demo/sky.js` (sun, sky dome and environment map, for outdoor films that need a real sky); face ideas from `../scifi-toon/demo/chars.js`. How the demo was made: [DEMO.md](DEMO.md).

## 11. Variation space

You decide the topic, the cast and their props, the places and their colour keys, the structure, the opening, the ending, the camera path and the timings. All far from any demo:

- **Default structure** (the genre's beat sheet, about 220–250 words for 60 s): hook (a strange act by an unnamed "he" or "they", plus stakes, at frame 0) → "You see," setup → mockery (one short quoted line) → the hero holds firm → two or three escalations ("Then…") → a self-interruption twist ("Wait, what?") → "You see," the real reason, through an everyday comparison → payoff image that proves the hero right. Present tense after the hook; specific numbers; true facts only; no call to action.
- Other structures: **second person** ("Imagine your boss walks you past your desk…": the viewer is the hero); **the explainer** (no rival: a weird instruction, "Now, here's the weird part", a famous name, a technical term, a callback to the hook); **the paradox** ("X is illegal, yet Y is on every street").
- Openings: the strange act mid-motion; the payoff location first, seen innocently; a close-up of the strange object.
- Endings: the payoff image with a short wry line; the loop cut; the rival's comeuppance as the last picture.

---

How our demo was made (story, shots, score, build): [DEMO.md](DEMO.md). Read it after your treatment exists.
