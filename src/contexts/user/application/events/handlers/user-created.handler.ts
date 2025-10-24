import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import * as emailServiceInterface from '../../../../../infrastructure/email/email.service.interface';

@Injectable()
@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler
  implements IEventHandler<UserCreatedEvent>
{
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  constructor(
    @Inject(emailServiceInterface.EMAIL_SERVICE)
    private readonly emailService: emailServiceInterface.EmailService,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log(`Handling UserCreatedEvent for user: ${event.aggregateId}`);

    try {
      // Send welcome email
      await this.emailService.sendWelcomeEmail(event.email, event.name);

      this.logger.log(`Welcome email sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${event.email}:`,
        error,
      );
      // In a production system, you might want to retry or queue for later
    }
  }
}
