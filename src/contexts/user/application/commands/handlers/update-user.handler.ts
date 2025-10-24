import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from '../update-user.command';
import { User } from '../../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../../ports/user.repository.port';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { id, name, email, addressId } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (email && email !== user.getEmail().getValue()) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.getId().getValue() !== id) {
        throw new Error('Email already in use by another user');
      }
    }

    if (name !== undefined) {
      user.updateName(name);
    }

    if (email !== undefined) {
      user.updateEmail(email);
    }

    if (addressId !== undefined) {
      user.updateAddressId(addressId);
    }

    return await this.userRepository.save(user);
  }
}
