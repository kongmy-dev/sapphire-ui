import { STYLESHEET_FILE, stylesheetSource } from './css/stylesheet';
import { generatedRegistry, REGISTRY_SOURCE } from './registry/generate.js';

export type Generator = {
  file: string;
  generate: (root: string) => string;
};

export const GENERATORS: readonly Generator[] = [
  { file: STYLESHEET_FILE, generate: stylesheetSource },
  { file: REGISTRY_SOURCE, generate: generatedRegistry },
];
