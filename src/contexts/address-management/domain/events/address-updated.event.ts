import { DomainEvent } from '../../../../shared/domain/base/aggregate-root';
import { randomUUID } from 'crypto';

export class AddressUpdatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType = 'AddressUpdated';
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;

  constructor(
    readonly aggregateId: string,
    street?: string,
    city?: string,
    zipCode?: string,
    country?: string,
  ) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.payload = {
      addressId: aggregateId,
      updatedFields: {
        ...(street && { street }),
        ...(city && { city }),
        ...(zipCode && { zipCode }),
        ...(country && { country }),
      },
    };
  }
}
