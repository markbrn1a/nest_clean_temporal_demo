import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CustomerCreatedEvent } from '../../../domain/events/customer-created.event';
import * as emailServiceInterface from '../../../../../infrastructure/email/email.service.interface';

@Injectable()
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedEventHandler
  implements IEventHandler<CustomerCreatedEvent>
{
  private readonly logger = new Logger(CustomerCreatedEventHandler.name);

  constructor(
    @Inject(emailServiceInterface.EMAIL_SERVICE)
    private readonly emailService: emailServiceInterface.EmailService,
  ) {}

  async handle(event: CustomerCreatedEvent): Promise<void> {
    this.logger.log(
      `Handling CustomerCreatedEvent for customer: ${event.aggregateId}`,
    );

    try {
      // Send customer welcome email
      await this.emailService.sendCustomerCreated(
        event.email,
        event.companyName,
      );

      this.logger.log(`Customer welcome email sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send customer welcome email to ${event.email}:`,
        error,
      );
    }
  }
}
