import { Injectable } from '@nestjs/common';
import { IEvent, ofType, Saga } from '@nestjs/cqrs';
import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserOnboardingRequestedEvent } from '../../../contexts/onboarding/domain/events/user-onboarding-requested.event';
import { TemporalService } from '../../../infrastructure/temporal/temporal.service';

@Injectable()
export class OnboardingSaga {
  constructor(private readonly temporalService: TemporalService) {}

  @Saga()
  userOnboardingRequested = (events$: Observable<IEvent>): Observable<any> => {
    return events$.pipe(
      ofType(UserOnboardingRequestedEvent),
      map((event: UserOnboardingRequestedEvent) => {
        console.log('OnboardingSaga: Received UserOnboardingRequestedEvent', {
          requestId: event.requestId,
          email: event.userData.email,
        });

        // Start the Temporal workflow when onboarding is requested
        this.startOnboardingWorkflow(event);

        // Return EMPTY since we don't need to dispatch any commands
        return EMPTY;
      }),
    );
  };

  private async startOnboardingWorkflow(
    event: UserOnboardingRequestedEvent,
  ): Promise<void> {
    try {
      const workflowId = `user-onboarding-${event.requestId}`;

      console.log('OnboardingSaga: Starting Temporal workflow', { workflowId });

      await this.temporalService.startWorkflow('userOnboardingWorkflow', {
        workflowId,
        taskQueue: 'main-task-queue',
        args: [
          {
            name: event.userData.name,
            email: event.userData.email,
            phone: event.userData.phone,
            companyName: event.userData.companyName,
            address: event.userData.address,
          },
        ],
      });

      console.log('OnboardingSaga: Successfully started Temporal workflow', {
        workflowId,
      });
    } catch (error) {
      // Handle the case where workflow already exists - this is not necessarily an error
      if (error.message?.includes('Workflow execution already started')) {
        console.log('OnboardingSaga: Workflow already started, skipping', {
          requestId: event.requestId,
          workflowId: `user-onboarding-${event.requestId}`,
        });
        return;
      }

      console.error('OnboardingSaga: Failed to start Temporal workflow', {
        requestId: event.requestId,
        error: error.message,
      });
      // Don't re-throw the error to prevent it from bubbling up and stopping the saga
    }
  }
}
