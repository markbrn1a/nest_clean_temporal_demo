import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { PaymentId } from '../value-objects/payment-id.vo';
import { Amount } from '../value-objects/amount.vo';
import { Currency } from '../value-objects/currency.vo';
import {
  PaymentStatus,
  PaymentStatusVO,
} from '../value-objects/payment-status.vo';
import { UserId } from '../../../user/domain/value-objects/user-id.vo';
import { CustomerId } from '../../../customer/domain/value-objects/customer-id.vo';

export class Payment extends AggregateRoot {
  constructor(
    private readonly id: PaymentId,
    private readonly userId: UserId,
    private readonly customerId: CustomerId | undefined,
    private readonly amount: Amount,
    private readonly currency: Currency,
    private status: PaymentStatusVO,
    private description?: string,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(
    userId: string,
    amount: number,
    currency: string = 'USD',
    customerId?: string,
    description?: string,
  ): Payment {
    return new Payment(
      new PaymentId(),
      new UserId(userId),
      customerId ? new CustomerId(customerId) : undefined,
      new Amount(amount),
      new Currency(currency),
      PaymentStatusVO.pending(),
      description,
      new Date(),
      new Date(),
    );
  }

  static fromPersistence(
    id: string,
    userId: string,
    customerId: string | null,
    amount: number,
    currency: string,
    status: PaymentStatus,
    description: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Payment {
    return new Payment(
      new PaymentId(id),
      new UserId(userId),
      customerId ? new CustomerId(customerId) : undefined,
      new Amount(amount),
      new Currency(currency),
      new PaymentStatusVO(status),
      description || undefined,
      createdAt,
      updatedAt,
    );
  }

  getId(): PaymentId {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getCustomerId(): CustomerId | undefined {
    return this.customerId;
  }

  getAmount(): Amount {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  getStatus(): PaymentStatusVO {
    return this.status;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateStatus(newStatus: PaymentStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to ${newStatus}`,
      );
    }
    this.status = new PaymentStatusVO(newStatus);
    this.updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  markAsProcessing(): void {
    this.updateStatus(PaymentStatus.PROCESSING);
  }

  markAsCompleted(): void {
    this.updateStatus(PaymentStatus.COMPLETED);
  }

  markAsFailed(): void {
    this.updateStatus(PaymentStatus.FAILED);
  }

  markAsCancelled(): void {
    this.updateStatus(PaymentStatus.CANCELLED);
  }

  markAsRefunded(): void {
    this.updateStatus(PaymentStatus.REFUNDED);
  }

  isRefundable(): boolean {
    return this.status.isCompleted();
  }

  isCancellable(): boolean {
    return this.status.isPending();
  }
}
