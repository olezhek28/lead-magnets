#!/usr/bin/env bash
# Скачивает исходную Tilda-страницу и все её картинки в docs/tilda-source/<слаг>,
# затем строит чертёж вёрстки. Сырьё в гит не попадает (см. .gitignore) —
# этот скрипт восстанавливает его заново.
#
#   ./scripts/tilda_sobrat.sh switch-na-go 5-go-tasks grpc-1-day

set -euo pipefail

KOREN="$(cd "$(dirname "$0")/.." && pwd)"
BRAUZER="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

if [ $# -eq 0 ]; then
  echo "Укажи слаги страниц, например: $0 switch-na-go" >&2
  exit 1
fi

for slug in "$@"; do
  katalog="$KOREN/docs/tilda-source/$slug"
  mkdir -p "$katalog/assets"

  curl -fsSL -A "$BRAUZER" "https://olezhek28.courses/$slug" -o "$katalog/page.html"

  # Из ссылок на CDN выкидывается сегмент ресайза вида /-/resize/560x/,
  # чтобы забрать оригиналы, а не превью.
  grep -oE "https://static\.tildacdn\.com/[^\"' )\\]*" "$katalog/page.html" \
    | sed 's/\\.*//' \
    | grep -iE '\.(png|jpg|jpeg|svg|webp|gif|mp4|webm)$' \
    | sed -E 's#/-/[^/]+/#/#' \
    | sort -u > "$katalog/assets.txt"

  : > "$katalog/assets-map.tsv"
  while read -r url; do
    # Имя папки на CDN уникально, а basename повторяется — префикс спасает от перезаписи.
    id="$(echo "$url" | sed -E 's#https://static\.tildacdn\.com/([^/]+)/.*#\1#')"
    imya="${id}__$(basename "$url")"
    curl -fsSL -A "$BRAUZER" "$url" -o "$katalog/assets/$imya"
    printf '%s\t%s\n' "$imya" "$url" >> "$katalog/assets-map.tsv"
  done < "$katalog/assets.txt"

  echo "$slug: $(ls "$katalog/assets" | wc -l | tr -d ' ') ассетов, $(du -sh "$katalog/assets" | cut -f1)"
  python3 "$KOREN/scripts/tilda_extract.py" "$katalog"
done
