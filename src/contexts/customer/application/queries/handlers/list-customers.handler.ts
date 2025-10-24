import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListCustomersQuery } from '../list-customers.query';
import { Customer } from '../../../domain/entities/customer.entity';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../ports/customer.repository.port';

@QueryHandler(ListCustomersQuery)
export class ListCustomersHandler implements IQueryHandler<ListCustomersQuery> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(query: ListCustomersQuery): Promise<Customer[]> {
    const { userId } = query;

    if (userId) {
      return await this.customerRepository.findByUserId(userId);
    }

    return await this.customerRepository.findAll();
  }
}
