import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteAddressCommand } from '../delete-address.command';
import {
  ADDRESS_REPOSITORY,
  type AddressRepositoryPort,
} from '../../ports/address.repository.port';

@CommandHandler(DeleteAddressCommand)
export class DeleteAddressHandler
  implements ICommandHandler<DeleteAddressCommand>
{
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
  ) {}

  async execute(command: DeleteAddressCommand): Promise<void> {
    const { id } = command;

    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress) {
      throw new Error('Address not found.');
    }

    await this.addressRepository.delete(id);
  }
}
