import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('notes', {
    id: { type: 'uuid', primaryKey: true },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    content: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    version: { type: 'integer', notNull: true, default: 1 },
  });
  pgm.addConstraint('notes', 'notes_title_nonempty', {
    check: 'length(trim(title)) > 0',
  });
  pgm.addConstraint('notes', 'notes_content_nonempty', {
    check: 'length(trim(content)) > 0',
  });
  pgm.addConstraint('notes', 'notes_version_positive', {
    check: 'version > 0',
  });
  pgm.createIndex('notes', ['user_id', 'created_at', 'id']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('notes');
}
