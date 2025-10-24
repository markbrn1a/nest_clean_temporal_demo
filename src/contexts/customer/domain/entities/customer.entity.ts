import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { CustomerId } from '../value-objects/customer-id.vo';
import { CompanyName } from '../value-objects/company-name.vo';
import { ContactName } from '../value-objects/contact-name.vo';
import { Email } from '../../../user/domain/value-objects/email.vo';
import { UserId } from '../../../user/domain/value-objects/user-id.vo';
import { AddressId } from '../../../address-management/domain/value-objects/address-id.vo';
import { CustomerCreatedEvent } from '../events/customer-created.event';
import { CustomerUpdatedEvent } from '../events/customer-updated.event';

export class Customer extends AggregateRoot {
  constructor(
    private readonly id: CustomerId,
    private readonly userId: UserId,
    private companyName: CompanyName,
    private contactName: ContactName,
    private email: Email,
    private phone?: string,
    private addressId?: AddressId,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(
    userId: string,
    companyName: string,
    contactName: string,
    email: string,
    phone?: string,
    addressId?: string,
  ): Customer {
    const customer = new Customer(
      new CustomerId(),
      new UserId(userId),
      new CompanyName(companyName),
      new ContactName(contactName),
      new Email(email),
      phone,
      addressId ? new AddressId(addressId) : undefined,
      new Date(),
      new Date(),
    );

    // Raise domain event for customer creation
    customer.apply(
      new CustomerCreatedEvent(
        customer.getId().getValue(),
        userId,
        email,
        companyName,
        contactName,
        phone,
        addressId,
      ),
    );

    return customer;
  }

  static fromPersistence(
    id: string,
    userId: string,
    companyName: string,
    contactName: string,
    email: string,
    phone: string | null,
    addressId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Customer {
    return new Customer(
      new CustomerId(id),
      new UserId(userId),
      new CompanyName(companyName),
      new ContactName(contactName),
      new Email(email),
      phone || undefined,
      addressId ? new AddressId(addressId) : undefined,
      createdAt,
      updatedAt,
    );
  }

  getId(): CustomerId {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getCompanyName(): CompanyName {
    return this.companyName;
  }

  getContactName(): ContactName {
    return this.contactName;
  }

  getEmail(): Email {
    return this.email;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  getAddressId(): AddressId | undefined {
    return this.addressId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateCompanyName(companyName: string): void {
    this.companyName = new CompanyName(companyName);
    this.updatedAt = new Date();
    this.raiseUpdatedEvent();
  }

  updateContactName(contactName: string): void {
    this.contactName = new ContactName(contactName);
    this.updatedAt = new Date();
    this.raiseUpdatedEvent();
  }

  updateEmail(email: string): void {
    this.email = new Email(email);
    this.updatedAt = new Date();
    this.raiseUpdatedEvent();
  }

  updatePhone(phone?: string): void {
    this.phone = phone;
    this.updatedAt = new Date();
    this.raiseUpdatedEvent();
  }

  updateAddressId(addressId?: string): void {
    this.addressId = addressId ? new AddressId(addressId) : undefined;
    this.updatedAt = new Date();
    this.raiseUpdatedEvent();
  }

  private raiseUpdatedEvent(): void {
    this.apply(
      new CustomerUpdatedEvent(
        this.getId().getValue(),
        this.getUserId().getValue(),
        this.getEmail().getValue(),
        this.getCompanyName().getValue(),
        this.getContactName().getValue(),
        this.getPhone(),
        this.getAddressId()?.getValue(),
      ),
    );
  }
}
