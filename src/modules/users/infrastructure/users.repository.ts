import type { UsersRepository } from '../domain/users.repository.js';
import type { UserRecord } from '../domain/user.js';

export type { UserRecord } from '../domain/user.js';

export class InMemoryUsersRepository implements UsersRepository {
  private readonly users = new Map<string, UserRecord>();

  async create(input: UserRecord): Promise<UserRecord> {
    this.users.set(input.id, input);
    return input;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  async list(): Promise<UserRecord[]> {
    return [...this.users.values()];
  }
}
