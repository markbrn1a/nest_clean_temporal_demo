export class ZipCode {
  private readonly value: string;

  constructor(zip: string) {
    if (!zip || zip.trim().length === 0) {
      throw new Error('Zip code cannot be empty');
    }
    if (!/^[A-Za-z0-9\s-]{3,15}$/.test(zip)) {
      throw new Error('Invalid zip code format');
    }
    this.value = zip.trim().toUpperCase();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ZipCode): boolean {
    return this.value === other.value;
  }
}
