import { randomUUID } from 'node:crypto';
import type { Note } from '../domain.js';
import type { InMemoryNotesRepository } from '../infrastructure/notes.repository.js';

export class NotesService {
  constructor(private readonly notesRepository: InMemoryNotesRepository) {}

  async create(input: { userId: string; title: string; content: string }): Promise<Note> {
    const title = input.title.trim();
    const content = input.content.trim();

    if (!title || !content) {
      throw new Error('Title and content are required.');
    }

    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      userId: input.userId,
      title,
      content,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    return this.notesRepository.create(note);
  }

  async list(userId: string): Promise<Note[]> {
    return this.notesRepository.listByUserId(userId);
  }

  async get(userId: string, noteId: string): Promise<Note | null> {
    const note = await this.notesRepository.findById(noteId);
    if (!note || note.userId !== userId) {
      return null;
    }

    return note;
  }

  async update(userId: string, noteId: string, input: { title?: string; content?: string }): Promise<Note> {
    const note = await this.notesRepository.findById(noteId);
    if (!note || note.userId !== userId) {
      throw new Error('Note not found or access denied.');
    }

    const nextNote: Note = {
      ...note,
      title: input.title?.trim() || note.title,
      content: input.content?.trim() || note.content,
      updatedAt: new Date().toISOString(),
      version: note.version + 1,
    };

    return this.notesRepository.update(nextNote);
  }

  async remove(userId: string, noteId: string): Promise<void> {
    const note = await this.notesRepository.findById(noteId);
    if (!note || note.userId !== userId) {
      throw new Error('Note not found or access denied.');
    }

    await this.notesRepository.remove(noteId);
  }
}
