import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from '../list-users.query';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryPort from '../../ports/user.repository.port';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    @Inject(userRepositoryPort.USER_REPOSITORY)
    private readonly userRepository: userRepositoryPort.UserRepositoryPort,
  ) {}

  async execute(query: ListUsersQuery): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
