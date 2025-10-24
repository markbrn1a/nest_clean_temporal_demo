import { ICommand } from '@nestjs/cqrs';

export class UpdateAddressCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly street?: string,
    public readonly city?: string,
    public readonly zipCode?: string,
    public readonly country?: string,
  ) {}
}
