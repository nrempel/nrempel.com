#!/bin/sh
set -eu

ROOT="$(cd "$(dirname "$0")" && pwd)"

"$ROOT/build.sh"
"$ROOT/build.sh" essay.html smaller-surfaces.html smaller-surfaces.md
"$ROOT/build.sh" feed-template.xml rss.xml feed-content.md
