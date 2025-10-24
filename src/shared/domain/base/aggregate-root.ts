export interface DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;
}

export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  protected apply(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }
}
