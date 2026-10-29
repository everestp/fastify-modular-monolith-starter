import type { Pool } from 'pg';
import type { Note } from '../domain/note.js';
import type { NotesRepository } from '../domain/notes.repository.js';

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: Date | string;
  updated_at: Date | string;
  version: number;
};

const toNote = (row: NoteRow): Note => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  content: row.content,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
  version: row.version,
});

const noteColumns = 'id, user_id, title, content, created_at, updated_at, version';

export class PostgresNotesRepository implements NotesRepository {
  constructor(private readonly pool: Pool) {}

  async create(note: Note): Promise<Note> {
    const result = await this.pool.query<NoteRow>(
      `INSERT INTO notes (${noteColumns})
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${noteColumns}`,
      [
        note.id,
        note.userId,
        note.title,
        note.content,
        note.createdAt,
        note.updatedAt,
        note.version,
      ],
    );

    return toNote(result.rows[0]!);
  }

  async listByUserId(userId: string): Promise<Note[]> {
    const result = await this.pool.query<NoteRow>(
      `SELECT ${noteColumns} FROM notes
       WHERE user_id = $1
       ORDER BY created_at, id`,
      [userId],
    );

    return result.rows.map(toNote);
  }

  async findById(id: string): Promise<Note | null> {
    const result = await this.pool.query<NoteRow>(
      `SELECT ${noteColumns} FROM notes WHERE id = $1`,
      [id],
    );

    return result.rows[0] ? toNote(result.rows[0]) : null;
  }

  async update(note: Note): Promise<Note> {
    const result = await this.pool.query<NoteRow>(
      `UPDATE notes
       SET title = $2, content = $3, updated_at = $4, version = $5
       WHERE id = $1
       RETURNING ${noteColumns}`,
      [note.id, note.title, note.content, note.updatedAt, note.version],
    );

    if (!result.rows[0]) {
      throw new Error('Note not found.');
    }

    return toNote(result.rows[0]);
  }

  async remove(id: string): Promise<void> {
    await this.pool.query('DELETE FROM notes WHERE id = $1', [id]);
  }
}
