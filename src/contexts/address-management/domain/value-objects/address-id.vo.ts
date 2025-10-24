import { randomUUID } from 'crypto';

export class AddressId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AddressId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
