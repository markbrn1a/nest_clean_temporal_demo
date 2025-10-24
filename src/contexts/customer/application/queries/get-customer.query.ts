import { IQuery } from '@nestjs/cqrs';

export class GetCustomerQuery implements IQuery {
  constructor(public readonly id: string) {}
}
