import { DomainEvent } from '../../../../shared/domain/base/aggregate-root';
import { randomUUID } from 'crypto';

export class AddressCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType = 'AddressCreated';
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;

  constructor(
    readonly aggregateId: string,
    street: string,
    city: string,
    zipCode: string,
    country: string,
  ) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.payload = {
      addressId: aggregateId,
      street,
      city,
      zipCode,
      country,
    };
  }
}
