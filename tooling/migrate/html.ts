import { migrateProps } from './api.js';
import { type Attribute, migrateAttributes } from './attributes.js';
import { issueAt, type Migration } from './result.js';

type Scan = { quote: string; depth: number };
const quotes = new Set(['"', "'", '`']);
function advance(state: Scan, char: string) {
  if (quotes.has(char)) state.quote = char;
  state.depth += { '{': 1, '}': -1 }[char] ?? 0;
}
function quoted(state: Scan, char: string, previous: string) {
  if (!state.quote) return false;
  if (char === state.quote && previous !== '\\') state.quote = '';
  return true;
}
function closing(text: string, start: number, stop: string, depth: number) {
  const state: Scan = { quote: '', depth: 0 };
  for (let index = start; index < text.length; index++) {
    const char = text[index] ?? '';
    const previous = text.charAt(index - 1);
    if (quoted(state, char, previous)) continue;
    if (char === stop && state.depth === depth) return index;
    advance(state, char);
  }
  return text.length;
}
function attributeOf(match: RegExpExecArray, start: number): Attribute | null {
  const name = match[1];
  if (!name) return null;
  const raw = match[2] ?? '';
  const quoted = quotes.has(raw[0] ?? '');
  const offset = start + match.index + match[0].lastIndexOf(raw);
  return {
    name: name.toLowerCase() === 'class' ? 'class' : name,
    start: start + match.index,
    end: offset + raw.length,
    value: quoted ? raw.slice(1, -1) : raw,
    valueStart: offset + Number(quoted),
    valueEnd: offset + raw.length - Number(quoted),
  };
}
function attributes(text: string, start: number, end: number) {
  const pattern = /([\w:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  return [...text.slice(start, end).matchAll(pattern)].flatMap((match) => {
    const result = attributeOf(match, start);
    return result ? [result] : [];
  });
}
function embedded(text: string, match: RegExpExecArray, migration: Migration) {
  if (match[0] === '{') {
    const end = closing(text, match.index + 1, '}', 0);
    if (
      /class(?:Name)?|variant|tone|icon|--color-|@kongmy|<[A-Z]/.test(
        text.slice(match.index, end),
      )
    )
      migration.issues.push(
        issueAt(
          text,
          match.index,
          'Embedded template expression needs manual migration',
        ),
      );
    return end + 1;
  }
  if (
    /^(?:style|script)$/i.test(match[1] ?? '') &&
    /--(?:color-|switch-|toast-|stack-|cluster-)|@kongmy-dev\/sapphire-ui|\.btn\b/.test(
      match[0],
    )
  )
    migration.issues.push(
      issueAt(
        text,
        match.index,
        'Embedded style/script needs manual import and token migration',
      ),
    );
  return match.index + match[0].length;
}
function opening(
  text: string,
  match: RegExpExecArray,
  names: Map<string, string>,
  migration: Migration,
) {
  const start = match.index + match[0].length;
  const end = closing(text, start, '>', 0);
  if (end === text.length || /[{}\\]|<%|<\?/.test(text.slice(start, end))) {
    migration.issues.push(
      issueAt(
        text,
        start,
        'Dynamic, escaped or unterminated markup needs manual migration',
      ),
    );
    return end + 1;
  }
  const found = attributes(text, start, end);
  const tag = match[2] ?? '';
  for (const attribute of found.filter((item) => item.name === 'style')) {
    if (
      /--(?:color-|switch-|toast-|stack-|cluster-)/.test(
        text.slice(attribute.start, attribute.end),
      )
    )
      migration.issues.push(
        issueAt(
          text,
          attribute.start,
          'Inline CSS needs manual token migration',
        ),
      );
  }
  migrateProps(text, tag, found, names, migration);
  migrateAttributes(
    text,
    {
      attributes: found,
      insert: text[end - 1] === '/' ? end - 1 : end,
      spread: false,
      component: names.has(tag),
    },
    migration,
  );
  return end + 1;
}
export function migrateHtml(
  text: string,
  migration: Migration,
  names: Map<string, string>,
) {
  const pattern =
    /<!--[\s\S]*?-->|<(script|style|textarea|title|xmp|iframe|noembed|noframes|plaintext)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)|<([a-zA-Z][\w:.-]*)\b|\{/gi;
  names.set('sapphire-banner', 'Banner');
  names.set('cookie-banner', 'CookieBanner');
  names.set('sapphire-toast', 'Toast');
  const frontmatter = /^---\r?\n[\s\S]*?\r?\n---/.exec(text);
  if (frontmatter) pattern.lastIndex = frontmatter[0].length;
  for (let match = pattern.exec(text); match; match = pattern.exec(text))
    pattern.lastIndex = match[2]
      ? opening(text, match, names, migration)
      : embedded(text, match, migration);
}
