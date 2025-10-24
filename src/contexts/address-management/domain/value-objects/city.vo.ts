export class City {
  private readonly value: string;

  constructor(city: string) {
    if (!city || city.trim().length === 0) {
      throw new Error('City cannot be empty');
    }
    if (city.length > 100) {
      throw new Error('City cannot exceed 100 characters');
    }
    this.value = city.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: City): boolean {
    return this.value === other.value;
  }
}
