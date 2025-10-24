import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { UserCreatedEvent } from '../../../contexts/user/domain/events/user-created.event';
import { TemporalService } from '../../../infrastructure/temporal/temporal.service';

@Injectable()
export class UserSaga {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly temporalService: TemporalService,
  ) {}

  @Saga()
  handleUserCreated = (events$: Observable<any>): Observable<any> =>
    events$.pipe(
      ofType(UserCreatedEvent),
      filter((event) => event.payload.context === 'ONBOARDING'), // Only handle onboarding users
      map(async (event: UserCreatedEvent) => {
        console.log(`🎯 User created for onboarding: ${event.email}`);

        // Start user onboarding workflow in Temporal
        const workflowId = `user-onboarding-${event.aggregateId}-${Date.now()}`;

        try {
          await this.temporalService.startWorkflow('createCustomerWorkflow', {
            workflowId,
            taskQueue: 'main-task-queue',
            args: [
              {
                userId: event.aggregateId,
                name: event.name,
                email: event.email,
              },
            ],
          });

          console.log(`✅ Started onboarding workflow: ${workflowId}`);
        } catch (error) {
          console.error(
            `❌ Failed to start workflow for user ${event.aggregateId}:`,
            error,
          );
        }
      }),
    );
}
