#!/bin/sh
#
# Runs the comment gate and size gate on the file that was just written, and hands
# the result back to the agent that wrote it.
#
# Exit 2 puts stderr in front of the model as feedback on work it can still fix in
# the same turn.

file=$(sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac
case "$file" in
  */tooling/quality-metrics/*|*/tooling/gates/*) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f "$file" ] || exit 0

comment_out=$(bun tooling/gates/comments.ts "$file" 2>&1)
comment_status=$?

size_out=$(bun tooling/quality-metrics/check.ts "$file" 2>&1)
size_status=$?

if [ $comment_status -ne 0 ] || [ $size_status -ne 0 ]; then
  [ $comment_status -ne 0 ] && printf '%s\n' "$comment_out" >&2
  [ $size_status -ne 0 ] && printf '%s\n' "$size_out" >&2
  exit 2
fi

exit 0
