export class Currency {
  private readonly value: string;
  private static readonly VALID_CURRENCIES = [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
  ];

  constructor(currency: string) {
    const upperCurrency = currency.toUpperCase();
    if (!Currency.VALID_CURRENCIES.includes(upperCurrency)) {
      throw new Error(
        `Invalid currency: ${currency}. Supported currencies: ${Currency.VALID_CURRENCIES.join(', ')}`,
      );
    }
    this.value = upperCurrency;
  }

  static usd(): Currency {
    return new Currency('USD');
  }

  static eur(): Currency {
    return new Currency('EUR');
  }

  static gbp(): Currency {
    return new Currency('GBP');
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Currency): boolean {
    return this.value === other.value;
  }

  static getSupportedCurrencies(): string[] {
    return [...Currency.VALID_CURRENCIES];
  }
}
