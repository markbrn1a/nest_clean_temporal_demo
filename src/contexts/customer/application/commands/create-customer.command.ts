import { ICommand } from '@nestjs/cqrs';

export class CreateCustomerCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly companyName: string,
    public readonly contactName: string,
    public readonly email: string,
    public readonly phone?: string,
    public readonly addressId?: string,
  ) {}
}
