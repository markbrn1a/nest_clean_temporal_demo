import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ADDRESS_REPOSITORY } from './application/ports/address.repository.port';
import { AddressController } from './presentation/http/address.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IntegrationModule } from '../../shared/integration/integration.module';

// Command Handlers
import { CreateAddressHandler } from './application/commands/handlers/create-address.handler';
import { UpdateAddressHandler } from './application/commands/handlers/update-address.handler';
import { DeleteAddressHandler } from './application/commands/handlers/delete-address.handler';

// Query Handlers
import { GetAddressHandler } from './application/queries/handlers/get-address.handler';
import { ListAddressesHandler } from './application/queries/handlers/list-addresses.handler';
import { PrismaAddressRepository } from './infrastructure/adapters/prisma-address.repository';

const CommandHandlers = [
  CreateAddressHandler,
  UpdateAddressHandler,
  DeleteAddressHandler,
];

const QueryHandlers = [GetAddressHandler, ListAddressesHandler];

@Module({
  imports: [CqrsModule, IntegrationModule],
  controllers: [AddressController],
  providers: [
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: ADDRESS_REPOSITORY,
      useClass: PrismaAddressRepository,
    },
  ],
  exports: [ADDRESS_REPOSITORY],
})
export class AddressManagementModule {}
