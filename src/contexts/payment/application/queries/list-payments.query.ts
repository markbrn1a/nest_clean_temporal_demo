import { IQuery } from '@nestjs/cqrs';

export class ListPaymentsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly customerId?: string,
  ) {}
}
