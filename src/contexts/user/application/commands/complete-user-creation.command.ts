import { ICommand } from '@nestjs/cqrs';

export class CompleteUserCreationCommand implements ICommand {
  constructor(
    public readonly tempUserId: string,
    public readonly addressId: string,
  ) {}
}
