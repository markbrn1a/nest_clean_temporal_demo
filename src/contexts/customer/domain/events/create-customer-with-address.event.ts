import { IEvent } from '@nestjs/cqrs';

export class CreateCustomerWithAddressEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly companyName: string,
    public readonly contactName: string,
    public readonly email: string,
    public readonly phone: string | undefined,
    public readonly address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    },
  ) {}
}
