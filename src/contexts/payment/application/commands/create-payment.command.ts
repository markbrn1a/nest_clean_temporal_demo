import { ICommand } from '@nestjs/cqrs';

export class CreatePaymentCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId?: string,
    public readonly description?: string,
  ) {}
}
