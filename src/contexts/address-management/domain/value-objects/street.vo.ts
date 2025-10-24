export class Street {
  private readonly value: string;

  constructor(street: string) {
    if (!street || street.trim().length === 0) {
      throw new Error('Street cannot be empty');
    }
    if (street.length > 200) {
      throw new Error('Street cannot exceed 200 characters');
    }
    this.value = street.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Street): boolean {
    return this.value === other.value;
  }
}
