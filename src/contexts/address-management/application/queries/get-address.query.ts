import { IQuery } from '@nestjs/cqrs';

export class GetAddressQuery implements IQuery {
  constructor(public readonly id: string) {}
}
