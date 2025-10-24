import { IEvent } from '@nestjs/cqrs';

export class CreateUserWithAddressEvent implements IEvent {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    },
  ) {}
}
