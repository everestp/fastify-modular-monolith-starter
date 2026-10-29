import type { Note } from '../domain/note.js';
import type { NotesRepository } from '../domain/notes.repository.js';

export class InMemoryNotesRepository implements NotesRepository {
  private readonly notes = new Map<string, Note>();

  async create(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  async listByUserId(userId: string): Promise<Note[]> {
    return [...this.notes.values()].filter((note) => note.userId === userId);
  }

  async findById(id: string): Promise<Note | null> {
    return this.notes.get(id) ?? null;
  }

  async update(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  async remove(id: string): Promise<void> {
    this.notes.delete(id);
  }
}
