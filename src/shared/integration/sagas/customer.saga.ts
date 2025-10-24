import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { CreateCustomerCommand } from '../../../contexts/customer/application/commands/create-customer.command';
import { CustomerCreatedEvent } from '../../../contexts/customer/domain/events/customer-created.event';
import { TemporalService } from '../../../infrastructure/temporal/temporal.service';

@Injectable()
export class CustomerSaga {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly temporalService: TemporalService,
  ) {}

  @Saga()
  handleCustomerCreated = (events$: Observable<any>): Observable<any> =>
    events$.pipe(
      ofType(CustomerCreatedEvent),
      filter((event) => event.payload.context === 'ONBOARDING'),
      map(async (event: CustomerCreatedEvent) => {
        console.log(
          `🎯 Customer created during onboarding: ${event.aggregateId}`,
        );

        // Start customer welcome workflow
        const workflowId = `customer-welcome-${event.aggregateId}-${Date.now()}`;

        try {
          await this.temporalService.startWorkflow('customerWelcomeWorkflow', {
            workflowId,
            taskQueue: 'main-task-queue',
            args: [
              {
                customerId: event.aggregateId,
                email: event.email,
                companyName: event.companyName,
              },
            ],
          });

          console.log(`✅ Started customer welcome workflow: ${workflowId}`);
        } catch (error) {
          console.error(
            `❌ Failed to start welcome workflow for customer ${event.aggregateId}:`,
            error,
          );
        }
      }),
    );
}
