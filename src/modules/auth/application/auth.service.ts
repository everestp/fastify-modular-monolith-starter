import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import type {
  InMemoryUsersRepository,
  UserRecord,
} from '../../users/infrastructure/users.repository.js';

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export class AuthService {
  constructor(private readonly usersRepository: InMemoryUsersRepository) {}

  async register(input: { email: string; password: string }): Promise<PublicUser> {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password || input.password.length < 8) {
      throw new Error(
        'Email and password are required. Password must be at least 8 characters long.',
      );
    }

    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists.');
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.usersRepository.create({
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    return this.toPublicUser(user);
  }

  async login(input: {
    email: string;
    password: string;
    issueToken: (userId: string, email: string, type: 'access' | 'refresh') => Promise<string>;
  }): Promise<{ accessToken: string; refreshToken: string; user: PublicUser }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const accessToken = await input.issueToken(user.id, user.email, 'access');
    const refreshToken = await input.issueToken(user.id, user.email, 'refresh');

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  async refresh(input: {
    userId: string;
    issueToken: (userId: string, email: string, type: 'access' | 'refresh') => Promise<string>;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found.');
    }

    return {
      accessToken: await input.issueToken(user.id, user.email, 'access'),
      refreshToken: await input.issueToken(user.id, user.email, 'refresh'),
    };
  }

  async getById(userId: string): Promise<PublicUser | null> {
    const user = await this.usersRepository.findById(userId);
    return user ? this.toPublicUser(user) : null;
  }

  private toPublicUser(user: UserRecord): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
