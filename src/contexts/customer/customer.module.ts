import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CUSTOMER_REPOSITORY } from './application/ports/customer.repository.port';
import { CustomerController } from './presentation/http/customer.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IntegrationModule } from '../../shared/integration/integration.module';
import { EmailModule } from '../../infrastructure/email/email.module';

// Command Handlers
import { CreateCustomerHandler } from './application/commands/handlers/create-customer.handler';
import { UpdateCustomerHandler } from './application/commands/handlers/update-customer.handler';
import { DeleteCustomerHandler } from './application/commands/handlers/delete-customer.handler';

// Query Handlers
import { GetCustomerHandler } from './application/queries/handlers/get-customer.handler';
import { ListCustomersHandler } from './application/queries/handlers/list-customers.handler';

// Event Handlers
import { CustomerCreatedEventHandler } from './application/events/handlers/customer-created.handler';

import { PrismaCustomerRepository } from './infrastructure/adapters/prisma-customer.repository';

const CommandHandlers = [
  CreateCustomerHandler,
  UpdateCustomerHandler,
  DeleteCustomerHandler,
];

const QueryHandlers = [GetCustomerHandler, ListCustomersHandler];

const EventHandlers = [CustomerCreatedEventHandler];

@Module({
  imports: [CqrsModule, IntegrationModule, EmailModule],
  controllers: [CustomerController],
  providers: [
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
})
export class CustomerModule {}
