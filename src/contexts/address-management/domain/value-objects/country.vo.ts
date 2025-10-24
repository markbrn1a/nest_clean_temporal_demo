export class Country {
  private readonly value: string;

  constructor(country: string) {
    if (!country || country.trim().length === 0) {
      throw new Error('Country cannot be empty');
    }
    if (country.length > 100) {
      throw new Error('Country cannot exceed 100 characters');
    }
    this.value = country.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Country): boolean {
    return this.value === other.value;
  }
}
