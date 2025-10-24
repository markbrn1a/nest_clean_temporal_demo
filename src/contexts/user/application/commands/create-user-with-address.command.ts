import { ICommand } from '@nestjs/cqrs';

export class CreateUserWithAddressCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly address?: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    },
  ) {}
}
