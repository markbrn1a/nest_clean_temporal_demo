import { IQuery } from '@nestjs/cqrs';

export class ListCustomersQuery implements IQuery {
  constructor(public readonly userId?: string) {}
}
