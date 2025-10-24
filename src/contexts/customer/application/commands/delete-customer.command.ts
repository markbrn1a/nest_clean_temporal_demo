import { ICommand } from '@nestjs/cqrs';

export class DeleteCustomerCommand implements ICommand {
  constructor(public readonly id: string) {}
}
