import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { AddressId } from '../value-objects/address-id.vo';
import { Street } from '../value-objects/street.vo';
import { City } from '../value-objects/city.vo';
import { ZipCode } from '../value-objects/zip-code.vo';
import { Country } from '../value-objects/country.vo';
import { AddressCreatedEvent } from '../events/address-created.event';
import { AddressUpdatedEvent } from '../events/address-updated.event';

export class Address extends AggregateRoot {
  constructor(
    private readonly id: AddressId,
    private street: Street,
    private city: City,
    private zipCode: ZipCode,
    private country: Country,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(
    street: string,
    city: string,
    zipCode: string,
    country: string,
  ): Address {
    const addressId = new AddressId();
    const streetVO = new Street(street);
    const cityVO = new City(city);
    const zipCodeVO = new ZipCode(zipCode);
    const countryVO = new Country(country);

    const address = new Address(
      addressId,
      streetVO,
      cityVO,
      zipCodeVO,
      countryVO,
      new Date(),
      new Date(),
    );

    address.apply(
      new AddressCreatedEvent(
        addressId.getValue(),
        street,
        city,
        zipCode,
        country,
      ),
    );

    return address;
  }

  static fromPersistence(
    id: string,
    street: string,
    city: string,
    zipCode: string,
    country: string,
    createdAt: Date,
    updatedAt: Date,
  ): Address {
    return new Address(
      new AddressId(id),
      new Street(street),
      new City(city),
      new ZipCode(zipCode),
      new Country(country),
      createdAt,
      updatedAt,
    );
  }

  getId(): AddressId {
    return this.id;
  }

  getStreet(): Street {
    return this.street;
  }

  getCity(): City {
    return this.city;
  }

  getZipCode(): ZipCode {
    return this.zipCode;
  }

  getCountry(): Country {
    return this.country;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateStreet(street: string): void {
    const newStreet = new Street(street);
    if (!this.street.equals(newStreet)) {
      this.street = newStreet;
      this.updatedAt = new Date();
      this.apply(new AddressUpdatedEvent(this.id.getValue(), street));
    }
  }

  updateCity(city: string): void {
    const newCity = new City(city);
    if (!this.city.equals(newCity)) {
      this.city = newCity;
      this.updatedAt = new Date();
      this.apply(new AddressUpdatedEvent(this.id.getValue(), undefined, city));
    }
  }

  updateZipCode(zipCode: string): void {
    const newZipCode = new ZipCode(zipCode);
    if (!this.zipCode.equals(newZipCode)) {
      this.zipCode = newZipCode;
      this.updatedAt = new Date();
      this.apply(
        new AddressUpdatedEvent(
          this.id.getValue(),
          undefined,
          undefined,
          zipCode,
        ),
      );
    }
  }

  updateCountry(country: string): void {
    const newCountry = new Country(country);
    if (!this.country.equals(newCountry)) {
      this.country = newCountry;
      this.updatedAt = new Date();
      this.apply(
        new AddressUpdatedEvent(
          this.id.getValue(),
          undefined,
          undefined,
          undefined,
          country,
        ),
      );
    }
  }

  update(
    street?: string,
    city?: string,
    zipCode?: string,
    country?: string,
  ): void {
    let hasChanges = false;
    const changes: {
      street?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    } = {};

    if (street && !this.street.equals(new Street(street))) {
      this.street = new Street(street);
      changes.street = street;
      hasChanges = true;
    }

    if (city && !this.city.equals(new City(city))) {
      this.city = new City(city);
      changes.city = city;
      hasChanges = true;
    }

    if (zipCode && !this.zipCode.equals(new ZipCode(zipCode))) {
      this.zipCode = new ZipCode(zipCode);
      changes.zipCode = zipCode;
      hasChanges = true;
    }

    if (country && !this.country.equals(new Country(country))) {
      this.country = new Country(country);
      changes.country = country;
      hasChanges = true;
    }

    if (hasChanges) {
      this.updatedAt = new Date();
      this.apply(
        new AddressUpdatedEvent(
          this.id.getValue(),
          changes.street,
          changes.city,
          changes.zipCode,
          changes.country,
        ),
      );
    }
  }

  getFullAddress(): string {
    return `${this.street.getValue()}, ${this.city.getValue()}, ${this.zipCode.getValue()}, ${this.country.getValue()}`;
  }
}
