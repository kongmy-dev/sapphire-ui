import type { A11yResult } from '../gates/a11y-coverage';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function testResults(value: unknown, title: string): A11yResult[] | null {
  if (
    !isRecord(value) ||
    typeof value.projectName !== 'string' ||
    !Array.isArray(value.results)
  )
    return null;
  const project = value.projectName;
  const results: A11yResult[] = [];
  for (const result of value.results) {
    if (!isRecord(result) || typeof result.status !== 'string') return null;
    results.push({ title, project, status: result.status });
  }
  return results;
}

function specResults(value: unknown): A11yResult[] | null {
  if (
    !isRecord(value) ||
    typeof value.title !== 'string' ||
    !Array.isArray(value.tests)
  )
    return null;
  const title = value.title;
  if (!title.startsWith('react/')) return [];
  const rows = value.tests.map((test) => testResults(test, title));
  return rows.some((row) => row === null)
    ? null
    : rows.flatMap((row) => row ?? []);
}

function suiteResults(value: unknown): A11yResult[] | null {
  if (!isRecord(value)) return null;
  const suites = value.suites ?? [];
  const specs = value.specs ?? [];
  if (!Array.isArray(suites) || !Array.isArray(specs)) return null;
  const rows = [...specs.map(specResults), ...suites.map(suiteResults)];
  return rows.some((row) => row === null)
    ? null
    : rows.flatMap((row) => row ?? []);
}

export function readA11yResults(text: string): A11yResult[] | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(value) || !Array.isArray(value.suites)) return null;
  return suiteResults(value);
}
