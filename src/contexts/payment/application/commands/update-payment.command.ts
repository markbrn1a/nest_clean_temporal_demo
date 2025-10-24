import { ICommand } from '@nestjs/cqrs';

export class UpdatePaymentCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly status?: string,
    public readonly description?: string,
  ) {}
}
