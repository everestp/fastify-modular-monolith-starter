import type { Note } from './note.js';

export interface NotesRepository {
  create(note: Note): Promise<Note>;
  listByUserId(userId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  update(note: Note): Promise<Note>;
  remove(id: string): Promise<void>;
}
