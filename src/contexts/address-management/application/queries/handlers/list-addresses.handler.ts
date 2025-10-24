import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAddressesQuery } from '../list-addresses.query';
import { Address } from '../../../domain/entities/address.entity';
import {
  ADDRESS_REPOSITORY,
  type AddressRepositoryPort,
} from '../../ports/address.repository.port';

@QueryHandler(ListAddressesQuery)
export class ListAddressesHandler implements IQueryHandler<ListAddressesQuery> {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
  ) {}

  async execute(query: ListAddressesQuery): Promise<Address[]> {
    return await this.addressRepository.findAll();
  }
}
