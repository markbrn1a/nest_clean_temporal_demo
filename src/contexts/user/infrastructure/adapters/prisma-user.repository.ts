import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      addressId: user.getAddressId()?.getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userData.id },
    });

    let savedUser;
    if (existingUser) {
      savedUser = await this.prisma.user.update({
        where: { id: userData.id },
        data: {
          name: userData.name,
          email: userData.email,
          addressId: userData.addressId,
          updatedAt: userData.updatedAt,
        },
      });
    } else {
      savedUser = await this.prisma.user.create({
        data: userData,
      });
    }

    return User.fromPersistence(
      savedUser.id,
      savedUser.name,
      savedUser.email,
      savedUser.addressId,
      savedUser.createdAt,
      savedUser.updatedAt,
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return User.fromPersistence(
      user.id,
      user.name,
      user.email,
      user.addressId,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return User.fromPersistence(
      user.id,
      user.name,
      user.email,
      user.addressId,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) =>
      User.fromPersistence(
        user.id,
        user.name,
        user.email,
        user.addressId,
        user.createdAt,
        user.updatedAt,
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
