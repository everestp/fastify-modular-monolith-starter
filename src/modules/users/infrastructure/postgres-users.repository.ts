import type { Pool } from 'pg';
import type { UsersRepository } from '../domain/users.repository.js';
import type { UserRecord } from '../domain/user.js';

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date | string;
};

const toUser = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  createdAt: new Date(row.created_at).toISOString(),
});

export class PostgresUsersRepository implements UsersRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: UserRecord): Promise<UserRecord> {
    const result = await this.pool.query<UserRow>(
      `INSERT INTO users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, password_hash, created_at`,
      [input.id, input.email, input.passwordHash, input.createdAt],
    );

    return toUser(result.rows[0]!);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, created_at FROM users WHERE id = $1',
      [id],
    );

    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()],
    );

    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async list(): Promise<UserRecord[]> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, created_at FROM users ORDER BY created_at, id',
    );

    return result.rows.map(toUser);
  }
}
