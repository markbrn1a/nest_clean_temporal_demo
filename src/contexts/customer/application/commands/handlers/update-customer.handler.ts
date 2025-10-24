import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { UpdateCustomerCommand } from '../update-customer.command';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import * as customerRepositoryPort from '../../ports/customer.repository.port';
import * as domainEventBusInterface from '../../../../../shared/integration/domain-event-bus.interface';
import { CustomerNotFoundError } from '../../../domain/exceptions/customer-not-found.error';
import { CustomerAlreadyExistsError } from '../../../domain/exceptions/customer-already-exists.error';

@CommandHandler(UpdateCustomerCommand)
export class UpdateCustomerHandler
  implements ICommandHandler<UpdateCustomerCommand>
{
  constructor(
    @Inject(customerRepositoryPort.CUSTOMER_REPOSITORY)
    private readonly customerRepository: customerRepositoryPort.CustomerRepositoryPort,
    @Inject(domainEventBusInterface.DOMAIN_EVENT_BUS)
    private readonly domainEventBus: domainEventBusInterface.DomainEventBus,
  ) {}

  async execute(command: UpdateCustomerCommand): Promise<Customer> {
    const { id, companyName, contactName, email, phone, addressId } = command;

    // Find existing customer
    const existingCustomer = await this.customerRepository.findById(
      new CustomerId(id),
    );
    if (!existingCustomer) {
      throw new CustomerNotFoundError(id);
    }

    // Check if email is being updated and if it conflicts with another customer
    if (email && email !== existingCustomer.getEmail().getValue()) {
      const customerWithEmail =
        await this.customerRepository.findByEmail(email);
      if (customerWithEmail && customerWithEmail.getId().getValue() !== id) {
        throw new CustomerAlreadyExistsError(email);
      }
    }

    // Update customer fields
    if (companyName) {
      existingCustomer.updateCompanyName(companyName);
    }
    if (contactName) {
      existingCustomer.updateContactName(contactName);
    }
    if (email) {
      existingCustomer.updateEmail(email);
    }
    if (phone !== undefined) {
      existingCustomer.updatePhone(phone);
    }
    if (addressId !== undefined) {
      existingCustomer.updateAddressId(addressId);
    }

    // Persist the customer
    await this.customerRepository.save(existingCustomer);

    // Publish domain events
    await this.domainEventBus.publishAll(existingCustomer.pullDomainEvents());

    return existingCustomer;
  }
}
