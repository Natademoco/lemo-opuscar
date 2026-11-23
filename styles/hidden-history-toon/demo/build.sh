#!/bin/sh
# Hidden History Toon · demo film "Ice in August": rebuilds the film, its poster and the style frame in one command.
# Everything is written to $OUT (default demo/out/, gitignored); the source is copied there and built in the copy, so this folder stays unchanged.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../../.." && pwd)}
OUT=${OUT:-$HERE/out}
PY=$LIB/.venv/bin/python
mkdir -p "$OUT"; rm -rf "$OUT/page"; mkdir "$OUT/page"; P=$OUT/page
(cd "$HERE" && tar cf - --exclude ./out --exclude ./stills . ) | (cd "$P" && tar xf -)
[ -f "$P/fonts/Montserrat-var.ttf" ] || curl -sfL -o "$P/fonts/Montserrat-var.ttf" "https://raw.githubusercontent.com/google/fonts/86aced91de05cd4f96a06838124cca45be337b2b/ofl/montserrat/Montserrat%5Bwght%5D.ttf"   # fonts stay local in the library: fetched, pinned to a commit
$PY "$LIB/core/tts/tts.py" "$P/lines.json" "$P/audio/voice"                   # narration + the rival's line (Kokoro)
$PY "$LIB/core/tts/asr_check.py" "$P/lines.json" "$P/audio/voice" --lang en    # every line must transcribe back; writes word timings
$PY "$LIB/core/tts/tts.py" "$P/laughs.json" "$P/audio/laughs"                 # the town laughing
python3 "$P/timeline.py"                                                       # line starts, caption words, mouth envelope
cd "$LIB"
node core/render/video.mjs "$P" --fps 30 --workers 4 --size 1080x1920 --out "$OUT/video.mp4"
$PY core/audio/sampler.py --need "$P/mix.py"
OUT="$OUT" LIB="$LIB" $PY "$P/mix.py"
sh core/render/mux.sh "$OUT/video.mp4" "$OUT/mix.wav" "$OUT/hidden-history-toon.mp4" 30 1
node core/render/still.mjs "$P" 25.5 --size 1080x1920 --q nocap=1 --prefix poster_ --out "$OUT" && mv "$OUT/poster_25.5.jpg" "$OUT/poster.jpg"
node core/render/still.mjs "$P" 0 --size 1080x1920 --q shot=frame --prefix frame_ --out "$OUT" && mv "$OUT/frame_0.jpg" "$OUT/styleframe.jpg"
echo "built: $OUT/hidden-history-toon.mp4"
