import { ICommand } from '@nestjs/cqrs';

export class DeletePaymentCommand implements ICommand {
  constructor(public readonly id: string) {}
}
