import { IEvent } from '@nestjs/cqrs';

export class StartPaymentProcessingEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly customerId: string | undefined,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description?: string,
  ) {}
}
