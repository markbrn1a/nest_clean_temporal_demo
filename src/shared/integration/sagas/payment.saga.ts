import { Injectable } from '@nestjs/common';
import { ICommand, IEvent, ofType, Saga } from '@nestjs/cqrs';
import { mergeMap, Observable, EMPTY } from 'rxjs';
import { TemporalService } from '../../../infrastructure/temporal/temporal.service';
import { StartPaymentProcessingEvent } from '../../../contexts/payment/domain/events/start-payment-processing.event';

@Injectable()
export class PaymentSaga {
  constructor(private readonly temporalService: TemporalService) {}

  @Saga()
  paymentProcessing = (events$: Observable<IEvent>): Observable<ICommand> => {
    return events$.pipe(
      ofType(StartPaymentProcessingEvent),
      mergeMap(async (event: StartPaymentProcessingEvent) => {
        // Start the payment processing workflow
        const workflowId = `send-payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          await this.temporalService.startWorkflow('sendPaymentWorkflow', {
            taskQueue: 'main-task-queue',
            args: [
              {
                userId: event.userId,
                customerId: event.customerId,
                amount: event.amount,
                currency: event.currency,
                description: event.description,
              },
            ],
            workflowId,
          });
          console.log(`Started payment workflow: ${workflowId}`);
        } catch (error) {
          console.error('Failed to start payment workflow:', error);
        }

        // Return empty observable since we don't need to dispatch any commands
        return EMPTY;
      }),
    );
  };
}
