#!/usr/bin/env bash
# Convert iPhone screen recordings (HEVC, heavy) into web-friendly H.264 with no
# audio, plus a poster frame. Outputs land in public/videos/<name>.mp4 + .jpg.
#
#   scripts/compress-video.sh ~/Desktop/RPReplay.MP4 defile
#   scripts/compress-video.sh recordings/*.MP4          # names from filenames
#
# Then set `video: '/videos/<name>.mp4'` in content/projects.ts.
set -euo pipefail

command -v ffmpeg >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }
[ $# -ge 1 ] || { sed -n '2,9p' "$0"; exit 1; }

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/videos"
mkdir -p "$OUT_DIR"

convert() {
  local in="$1" name="$2"
  local out="$OUT_DIR/$name.mp4" poster="$OUT_DIR/$name.jpg"
  echo "→ $in  ⇒  public/videos/$name.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$in" -an \
    -vf "scale=-2:1200,fps=30" -c:v libx264 -profile:v high -crf 28 -preset slow \
    -movflags +faststart -pix_fmt yuv420p "$out"
  # Poster: first frame of the compressed video, so it matches exactly.
  ffmpeg -hide_banner -loglevel error -y -i "$out" -frames:v 1 -q:v 4 "$poster"
  printf '   %s → %s (poster %s)\n' "$(du -h "$in" | cut -f1)" "$(du -h "$out" | cut -f1)" "$(du -h "$poster" | cut -f1)"
}

# Two args where the second isn't a file → explicit output name.
if [ $# -eq 2 ] && [ ! -e "$2" ]; then
  convert "$1" "$2"
else
  for f in "$@"; do
    base="$(basename "$f")"
    name="$(echo "${base%.*}" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/-*$//')"
    convert "$f" "$name"
  done
fi
