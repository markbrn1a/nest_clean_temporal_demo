import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAddressQuery } from '../get-address.query';
import { Address } from '../../../domain/entities/address.entity';
import {
  ADDRESS_REPOSITORY,
  type AddressRepositoryPort,
} from '../../ports/address.repository.port';

@QueryHandler(GetAddressQuery)
export class GetAddressHandler implements IQueryHandler<GetAddressQuery> {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
  ) {}

  async execute(query: GetAddressQuery): Promise<Address | null> {
    const { id } = query;
    return await this.addressRepository.findById(id);
  }
}
