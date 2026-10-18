#!/bin/sh
#
# Runs the gates that apply to the file that was just written and hands the result
# back to the agent that wrote it. Exit 2 puts stderr in front of the model as
# feedback on work it can still fix in the same turn.
#
# A file under src/ runs the freeze gate (P-17). Any other TS, TSX, JS or CSS file
# outside the frozen lane runs the comment gate (P-1), and TS and TSX also the
# size gate (P-7).

file=$(sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.mts|*.cts|*.css) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f "$file" ] || exit 0
rel=${file#"$(pwd -P)"/}

case "$rel" in
  src/*)
    out=$(bun tooling/gates/freeze.ts 2>&1) && exit 0
    printf '%s\n' "$out" >&2
    exit 2
    ;;
  registry/blocks/*|tests/registry-consumer/app/*|design/*) exit 0 ;;
esac

status=0
out=$(bun tooling/gates/comments.ts "$rel" 2>&1) || {
  printf '%s\n' "$out" >&2
  status=2
}

case "$rel" in
  *.ts|*.tsx)
    out=$(bun tooling/gates/size.ts "$rel" 2>&1) || {
      printf '%s\n' "$out" >&2
      status=2
    }
    ;;
esac

exit $status
