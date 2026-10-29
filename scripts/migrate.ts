import 'dotenv/config';
import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';
import { parseEnv } from '../src/config/env.schema.js';

const migrationsDirectory = fileURLToPath(new URL('../migrations', import.meta.url));

const createMigration = async (name: string | undefined) => {
  const slug = name
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  if (!slug) {
    throw new Error('Provide a migration name, for example: npm run migrate:create -- add_tags.');
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const filename = `${timestamp}_${slug}.ts`;
  const files = await readdir(migrationsDirectory);
  if (files.some((file) => file.startsWith(`${timestamp}_`))) {
    throw new Error('A migration with this timestamp already exists. Try again.');
  }

  await writeFile(
    new URL(`../migrations/${filename}`, import.meta.url),
    `import type { MigrationBuilder } from 'node-pg-migrate';\n\nexport async function up(pgm: MigrationBuilder): Promise<void> {}\n\nexport async function down(pgm: MigrationBuilder): Promise<void> {}\n`,
    { flag: 'wx' },
  );
  console.info(`Created migrations/${filename}`);
};

const main = async () => {
  const action = process.argv[2] ?? 'up';
  if (action === 'create') {
    await createMigration(process.argv[3]);
    return;
  }
  if (action !== 'up' && action !== 'down') {
    throw new Error(`Unknown migration action: ${action}. Use up, down, or create.`);
  }

  await runner({
    databaseUrl: parseEnv().DATABASE_URL,
    dir: migrationsDirectory,
    direction: action,
    count: action === 'down' ? 1 : Infinity,
    migrationsTable: 'schema_migrations',
    checkOrder: true,
    verbose: true,
  });
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
