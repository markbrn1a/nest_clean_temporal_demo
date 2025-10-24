import { v4 as uuidv4 } from 'uuid';
import { DomainEvent } from '../../../../shared/domain/base/aggregate-root';

export class UserOnboardingRequestedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly eventType: string = 'UserOnboardingRequested';
  public readonly occurredOn: Date;
  public readonly payload: Record<string, any>;

  constructor(
    public readonly requestId: string,
    public readonly userData: {
      name: string;
      email: string;
      phone?: string;
      companyName?: string;
      address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
      };
    },
    timestamp: Date = new Date(),
  ) {
    this.eventId = uuidv4();
    this.aggregateId = requestId; // Use requestId as aggregate identifier
    this.occurredOn = timestamp;
    this.payload = {
      requestId,
      userData,
      timestamp,
    };
  }
}
