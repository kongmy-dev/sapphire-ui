import { migrateClasses } from './class-values.js';
import { issueAt, type Migration } from './result.js';

export type Attribute = {
  name: string;
  start: number;
  end: number;
  value: string | null;
  valueStart: number;
  valueEnd: number;
};
export type Opening = {
  attributes: Attribute[];
  insert: number;
  spread: boolean;
  component: boolean;
};

function additionsFor(
  opening: Opening,
  result: ReturnType<typeof migrateClasses>,
) {
  const additions: string[] = [];
  let conflicts = result.issues.some((issue) =>
    issue.includes('conflicting legacy'),
  );
  for (const [name, value] of result.attributes) {
    const expected = value ?? '';
    const existing = opening.attributes.find(
      (candidate) => candidate.name === name,
    );
    if (!existing) {
      additions.push(` ${name}="${expected}"`);
      continue;
    }
    conflicts ||= existing.value !== expected;
  }
  return {
    additions,
    conflicts: conflicts || (opening.spread && additions.length > 0),
  };
}

function writeClass(
  text: string,
  attribute: Attribute,
  opening: Opening,
  value: string,
  additions: string[],
  migration: Migration,
) {
  const quoted = /["'`]/.test(text[attribute.valueStart - 1] ?? '');
  if (value !== attribute.value)
    migration.edits.push({
      start: attribute.valueStart,
      end: attribute.valueEnd,
      text: quoted ? value : JSON.stringify(value),
    });
  if (additions.length)
    migration.edits.push({
      start: opening.insert,
      end: opening.insert,
      text: additions.join(''),
    });
}

function migrateClass(
  text: string,
  attribute: Attribute,
  opening: Opening,
  migration: Migration,
) {
  if (attribute.value === null || /&(?:#\w+|\w+);/.test(attribute.value)) {
    migration.issues.push(
      issueAt(
        text,
        attribute.start,
        'Dynamic or entity-encoded classes need manual migration',
      ),
    );
    return;
  }
  const result = migrateClasses(attribute.value);
  migration.issues.push(
    ...result.issues.map((message) => issueAt(text, attribute.start, message)),
  );
  if (opening.component && result.attributes.size > 0) {
    migration.issues.push(
      issueAt(
        text,
        attribute.start,
        'Component-owned data attributes require public props; migrate this class list manually',
      ),
    );
    return;
  }
  const { additions, conflicts } = additionsFor(opening, result);
  if (conflicts) {
    migration.issues.push(
      issueAt(
        text,
        attribute.start,
        'Existing attributes or spread may conflict; migrate this class list manually',
      ),
    );
    return;
  }
  writeClass(text, attribute, opening, result.value, additions, migration);
}

export function migrateAttributes(
  text: string,
  opening: Opening,
  migration: Migration,
) {
  for (const attribute of opening.attributes.filter(
    (item) => item.name === 'class' || item.name === 'className',
  ))
    migrateClass(text, attribute, opening, migration);
}
