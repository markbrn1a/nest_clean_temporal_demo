export class CompanyName {
  private readonly value: string;

  constructor(companyName: string) {
    if (!companyName || companyName.trim().length < 2) {
      throw new Error('Company name must be at least 2 characters long');
    }
    this.value = companyName.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CompanyName): boolean {
    return this.value === other.value;
  }
}
