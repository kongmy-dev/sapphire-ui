import { classRenames, unmappedClasses, utilityRenames } from './map.js';

const classes: Readonly<Record<string, string>> = classRenames;
const manual: Readonly<Record<string, string>> = unmappedClasses;
const colors: Readonly<Record<string, string>> = utilityRenames.color;
const ambiguous = new Set([
  'dark',
  'up',
  'down',
  'plan',
  'proposal',
  'published',
  'draft',
  'review',
  'x',
  'section',
  'subtotal',
  'total',
  'muted',
  'rule',
  'dot',
]);
type Collected = {
  next: string[];
  attributes: Map<string, string | null>;
  issues: string[];
};

const colorUtility =
  /^(.*?)(border-[xysetrbl]|ring-offset|inset-ring|inset-shadow|text-shadow|bg|text|border|ring|outline|fill|stroke|decoration|placeholder|divide|shadow|caret|accent|from|via|to)-([\w-]+)(\/[^\s]+)?$/;

function utility(value: string, result: Collected): string {
  const match = colorUtility.exec(value);
  if (!match) return value;
  const [, prefix, kind, name, opacity = ''] = match;
  if (prefix && !prefix.endsWith(':')) return value;
  if (name === 'accent') {
    result.issues.push(
      `${value}: accent may be the v4 quiet surface or the old brand colour; choose manually`,
    );
    return value;
  }
  const renamed = name && colors[name];
  return renamed ? `${prefix}${kind}-${renamed}${opacity}` : value;
}

function addSelector(selector: string, result: Collected) {
  result.next.push(
    ...[...selector.matchAll(/\.([\w-]+)/g)].flatMap((match) =>
      match[1] ? [match[1]] : [],
    ),
  );
  for (const match of selector.matchAll(/\[([\w-]+)(?:=([^\]]+))?\]/g)) {
    const name = match[1];
    if (!name) continue;
    const attribute = match[2] ?? null;
    if (
      result.attributes.has(name) &&
      result.attributes.get(name) !== attribute
    )
      result.issues.push(`${name}: conflicting legacy modifiers`);
    result.attributes.set(name, attribute);
  }
}

function addClass(word: string, result: Collected) {
  const selector = classes[`.${word}`];
  if (manual[`.${word}`]) result.issues.push(`${word}: ${manual[`.${word}`]}`);
  if (!selector) {
    result.next.push(utility(word, result));
    return;
  }
  if (ambiguous.has(word)) {
    result.issues.push(
      `${word}: ambiguous class; choose ${selector} only in its component context`,
    );
    result.next.push(word);
    return;
  }
  addSelector(selector, result);
}

export function migrateClasses(value: string) {
  const result: Collected = { next: [], attributes: new Map(), issues: [] };
  for (const word of value.split(/\s+/).filter(Boolean)) addClass(word, result);
  return {
    value: [...new Set(result.next)].join(' '),
    attributes: result.attributes,
    issues: result.issues,
  };
}
