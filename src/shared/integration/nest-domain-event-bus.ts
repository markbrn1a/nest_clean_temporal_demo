import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainEvent } from '../domain/base/aggregate-root';
import { DomainEventBus } from './domain-event-bus.interface';

@Injectable()
export class NestDomainEventBus implements DomainEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.eventBus.publish(event)));
  }
}
