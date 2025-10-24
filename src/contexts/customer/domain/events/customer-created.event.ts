import { DomainEvent } from '../../../../shared/domain/base/aggregate-root';
import { v4 as uuid } from 'uuid';

export class CustomerCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly eventType: string = 'CustomerCreated';
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;

  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly companyName: string,
    public readonly contactName: string,
    public readonly phone?: string,
    public readonly addressId?: string,
    public readonly context?: string,
  ) {
    this.eventId = uuid();
    this.occurredOn = new Date();
    this.payload = {
      userId: this.userId,
      email: this.email,
      companyName: this.companyName,
      contactName: this.contactName,
      phone: this.phone,
      addressId: this.addressId,
      context: this.context,
    };
  }
}
