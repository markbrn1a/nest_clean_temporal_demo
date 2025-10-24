export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email;
  }

  private isValid(email: string): boolean {
    return email.includes('@');
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email) {
    return this.value === other.value;
  }
}
