import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { AddressId } from '../../../address-management/domain/value-objects/address-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export class User extends AggregateRoot {
  constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private addressId?: AddressId,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(
    name: string,
    email: string,
    addressId?: string,
    context?: string,
    metadata?: Record<string, any>,
  ) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const user = new User(
      new UserId(),
      name.trim(),
      new Email(email),
      addressId ? new AddressId(addressId) : undefined,
      new Date(),
      new Date(),
    );

    // Raise domain event for user creation
    user.apply(
      new UserCreatedEvent(
        user.getId().getValue(),
        name.trim(),
        email,
        addressId,
        context,
        metadata,
      ),
    );

    return user;
  }

  static fromPersistence(
    id: string,
    name: string,
    email: string,
    addressId: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      new UserId(id),
      name,
      new Email(email),
      addressId ? new AddressId(addressId) : undefined,
      createdAt,
      updatedAt,
    );
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
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

  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    this.name = name.trim();
    this.updatedAt = new Date();
  }

  updateEmail(email: string) {
    this.email = new Email(email);
    this.updatedAt = new Date();
  }

  updateAddressId(addressId?: string): void {
    this.addressId = addressId ? new AddressId(addressId) : undefined;
    this.updatedAt = new Date();
  }

  getAccountAge(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
