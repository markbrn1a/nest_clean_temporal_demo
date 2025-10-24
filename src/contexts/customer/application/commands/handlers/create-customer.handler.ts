import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCustomerCommand } from '../create-customer.command';
import { Customer } from '../../../domain/entities/customer.entity';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../ports/customer.repository.port';
import {
  DOMAIN_EVENT_BUS,
  type DomainEventBus,
} from '../../../../../shared/integration/domain-event-bus.interface';
import { CustomerAlreadyExistsError } from '../../../domain/exceptions/customer-already-exists.error';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const { userId, companyName, contactName, email, phone, addressId } =
      command;

    // Check if customer with this email already exists (business rule)
    const existingCustomer = await this.customerRepository.findByEmail(email);
    if (existingCustomer) {
      throw new CustomerAlreadyExistsError(email);
    }

    // Create new customer (domain logic with events)
    const customer = Customer.create(
      userId,
      companyName,
      contactName,
      email,
      phone,
      addressId,
    );

    // Persist the customer
    await this.customerRepository.save(customer);

    // Publish domain events
    await this.domainEventBus.publishAll(customer.pullDomainEvents());

    return customer;
  }
}
