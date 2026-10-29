import { Type } from '@sinclair/typebox';

export const NoteSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  title: Type.String(),
  content: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  version: Type.Number(),
});

export const CreateNoteBodySchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  content: Type.String({ minLength: 1, maxLength: 5000 }),
});

export const UpdateNoteBodySchema = Type.Partial(CreateNoteBodySchema, {
  minProperties: 1,
});
