import { smokeRegistry } from '../registry/smoke';
import { smokePackage } from './smoke';

const root = process.cwd();
const tarball = await smokePackage(root);
await smokeRegistry(root, tarball);
