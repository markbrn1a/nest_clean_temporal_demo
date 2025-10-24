import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { UserController } from './presentation/http/user.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IntegrationModule } from '../../shared/integration/integration.module';
import { EmailModule } from '../../infrastructure/email/email.module';

// Command Handlers
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { UpdateUserHandler } from './application/commands/handlers/update-user.handler';
import { DeleteUserHandler } from './application/commands/handlers/delete-user.handler';

// Query Handlers
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { ListUsersHandler } from './application/queries/handlers/list-users.handler';

// Event Handlers
import { UserCreatedEventHandler } from './application/events/handlers/user-created.handler';

import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

const QueryHandlers = [GetUserHandler, ListUsersHandler];

const EventHandlers = [UserCreatedEventHandler];

@Module({
  imports: [CqrsModule, IntegrationModule, EmailModule],
  controllers: [UserController],
  providers: [
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
