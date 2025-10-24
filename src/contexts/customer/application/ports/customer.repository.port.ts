import { Customer } from '../../domain/entities/customer.entity';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';

export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByUserId(userId: string): Promise<Customer[]>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  delete(id: CustomerId): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
