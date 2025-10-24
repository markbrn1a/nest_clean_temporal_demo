import { Address } from '../../domain/entities/address.entity';

export interface AddressRepositoryPort {
  save(address: Address): Promise<Address> | Address;
  findById(id: string): Promise<Address | null> | Address | null;
  findAll(): Promise<Address[]> | Address[];
  delete(id: string): Promise<void> | void;
}

export const ADDRESS_REPOSITORY = Symbol('ADDRESS_REPOSITORY');
