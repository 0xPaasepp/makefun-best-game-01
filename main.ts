// Reproducible ECHODEEP submission builder. Node 22, no dependencies.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const source = fileURLToPath(new URL('.', import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (destination === resolve(source)) throw new Error('Output must differ from the repository');
mkdirSync(destination, { recursive: true });
for (const directory of ['game', 'screenshots']) {
  const target = join(destination, directory);
  rmSync(target, { recursive: true, force: true });
  cpSync(join(source, directory), target, { recursive: true });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
console.log(`ECHODEEP: ${dossier.byteLength} dossier bytes written to ${destination}`);
