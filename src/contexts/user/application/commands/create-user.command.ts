import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly addressId?: string,
    public readonly context?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
