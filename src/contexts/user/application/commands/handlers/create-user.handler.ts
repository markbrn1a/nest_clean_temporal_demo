import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryPort from '../../ports/user.repository.port';
import * as domainEventBusInterface from '../../../../../shared/integration/domain-event-bus.interface';
import { UserAlreadyExistsError } from '../../../domain/exceptions/user-already-exists.error';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(userRepositoryPort.USER_REPOSITORY)
    private readonly userRepository: userRepositoryPort.UserRepositoryPort,
    @Inject(domainEventBusInterface.DOMAIN_EVENT_BUS)
    private readonly domainEventBus: domainEventBusInterface.DomainEventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { name, email, addressId, context, metadata } = command;

    // Check if user with this email already exists (business rule)
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    // Create new user (domain logic with events)
    const user = User.create(name, email, addressId, context, metadata);

    // Persist the user
    const savedUser = await this.userRepository.save(user);

    // Publish domain events
    await this.domainEventBus.publishAll(user.pullDomainEvents());

    return savedUser;
  }
}
