import { DomainEvent } from '../../../../shared/domain/base/aggregate-root';
import { v4 as uuid } from 'uuid';

export class UserCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'UserCreated';
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;

  constructor(
    public readonly aggregateId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly addressId?: string,
    public readonly context?: string,
    public readonly metadata?: Record<string, any>,
  ) {
    this.eventId = uuid();
    this.occurredOn = new Date();
    this.payload = {
      name: this.name,
      email: this.email,
      addressId: this.addressId,
      context: this.context,
      ...this.metadata,
    };
  }
}
