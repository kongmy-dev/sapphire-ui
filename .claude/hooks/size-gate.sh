#!/bin/sh
#
# Runs the size gate on the file that was just written, and hands the result back to the
# agent that wrote it.
#
# It is PostToolUse rather than PreToolUse deliberately: the interesting number cannot be
# computed from a diff, only from the file that results, and a gate that refuses the write
# leaves the agent guessing at what would have been acceptable. Exit 2 puts stderr in front
# of the model as feedback on work it can still fix in the same turn — which is the whole
# point. Anywhere later than this and the context that produced the code is gone.

file=$(sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
case "$file" in
  */tooling/quality-metrics/*) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f "$file" ] || exit 0

out=$(bun tooling/quality-metrics/check.ts "$file" 2>&1)
[ $? -eq 0 ] && exit 0

printf '%s\n' "$out" >&2
exit 2
