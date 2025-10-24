import { randomUUID } from 'crypto';

export class PaymentId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PaymentId): boolean {
    return this.value === other.value;
  }
}
