import { User } from '../../domain/entities/user.entity';

export interface UserRepositoryPort {
  save(user: User): Promise<User> | User;
  findById(id: string): Promise<User | null> | User | null;
  findByEmail(email: string): Promise<User | null> | User | null;
  findAll(): Promise<User[]> | User[];
  delete(id: string): Promise<void> | void;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
