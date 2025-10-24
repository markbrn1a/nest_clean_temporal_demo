export class Amount {
  private readonly value: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a valid number');
    }
    // Round to 2 decimal places for currency precision
    this.value = Math.round(amount * 100) / 100;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Amount): boolean {
    return this.value === other.value;
  }

  add(other: Amount): Amount {
    return new Amount(this.value + other.value);
  }

  subtract(other: Amount): Amount {
    return new Amount(this.value - other.value);
  }

  multiply(factor: number): Amount {
    return new Amount(this.value * factor);
  }

  isGreaterThan(other: Amount): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Amount): boolean {
    return this.value < other.value;
  }
}
