import { STYLESHEET_FILE, stylesheetSource } from './css/stylesheet';

export type Generator = {
  file: string;
  generate: (root: string) => string;
};

export const GENERATORS: readonly Generator[] = [
  { file: STYLESHEET_FILE, generate: stylesheetSource },
];
