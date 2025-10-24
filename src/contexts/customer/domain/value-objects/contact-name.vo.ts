export class ContactName {
  private readonly value: string;

  constructor(contactName: string) {
    if (!contactName || contactName.trim().length < 2) {
      throw new Error('Contact name must be at least 2 characters long');
    }
    this.value = contactName.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ContactName): boolean {
    return this.value === other.value;
  }
}
