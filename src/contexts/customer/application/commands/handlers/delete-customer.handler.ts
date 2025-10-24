import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { DeleteCustomerCommand } from '../delete-customer.command';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import {
  type CustomerRepositoryPort,
  CUSTOMER_REPOSITORY,
} from '../../ports/customer.repository.port';

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler
  implements ICommandHandler<DeleteCustomerCommand>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(command: DeleteCustomerCommand): Promise<void> {
    const { id } = command;

    // Check if customer exists before deleting
    const existingCustomer = await this.customerRepository.findById(
      new CustomerId(id),
    );
    if (!existingCustomer) {
      throw new Error('Customer not found.');
    }

    await this.customerRepository.delete(new CustomerId(id));
  }
}
