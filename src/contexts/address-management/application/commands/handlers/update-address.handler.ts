import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateAddressCommand } from '../update-address.command';
import { Address } from '../../../domain/entities/address.entity';
import * as addressRepositoryPort from '../../ports/address.repository.port';
import * as domainEventBusInterface from '../../../../../shared/integration/domain-event-bus.interface';

@CommandHandler(UpdateAddressCommand)
export class UpdateAddressHandler
  implements ICommandHandler<UpdateAddressCommand>
{
  constructor(
    @Inject(addressRepositoryPort.ADDRESS_REPOSITORY)
    private readonly addressRepository: addressRepositoryPort.AddressRepositoryPort,
    @Inject(domainEventBusInterface.DOMAIN_EVENT_BUS)
    private readonly eventBus: domainEventBusInterface.DomainEventBus,
  ) {}

  async execute(command: UpdateAddressCommand): Promise<Address> {
    const { id, street, city, zipCode, country } = command;

    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress) {
      throw new Error('Address not found.');
    }

    existingAddress.update(street, city, zipCode, country);
    const savedAddress = await this.addressRepository.save(existingAddress);

    // Publish domain events
    await this.eventBus.publishAll(existingAddress.pullDomainEvents());

    return savedAddress;
  }
}
