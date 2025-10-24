import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAddressCommand } from '../create-address.command';
import { Address } from '../../../domain/entities/address.entity';
import {
  ADDRESS_REPOSITORY,
  type AddressRepositoryPort,
} from '../../ports/address.repository.port';
import {
  DOMAIN_EVENT_BUS,
  type DomainEventBus,
} from '../../../../../shared/integration/domain-event-bus.interface';

@CommandHandler(CreateAddressCommand)
export class CreateAddressHandler
  implements ICommandHandler<CreateAddressCommand>
{
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
  ) {}

  async execute(command: CreateAddressCommand): Promise<string> {
    const { street, city, zipCode, country } = command;

    const address = Address.create(street, city, zipCode, country);
    const savedAddress = await this.addressRepository.save(address);

    // Publish domain events
    await this.domainEventBus.publishAll(address.pullDomainEvents());

    return savedAddress.getId().getValue();
  }
}
