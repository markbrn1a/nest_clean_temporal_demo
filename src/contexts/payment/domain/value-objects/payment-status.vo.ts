export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class PaymentStatusVO {
  private readonly value: PaymentStatus;

  constructor(status: PaymentStatus) {
    this.value = status;
  }

  static pending(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.PENDING);
  }

  static processing(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.PROCESSING);
  }

  static completed(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.COMPLETED);
  }

  static failed(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.FAILED);
  }

  static cancelled(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.CANCELLED);
  }

  static refunded(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatus.REFUNDED);
  }

  getValue(): PaymentStatus {
    return this.value;
  }

  equals(other: PaymentStatusVO): boolean {
    return this.value === other.value;
  }

  isPending(): boolean {
    return this.value === PaymentStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.value === PaymentStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.value === PaymentStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.value === PaymentStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.value === PaymentStatus.CANCELLED;
  }

  isRefunded(): boolean {
    return this.value === PaymentStatus.REFUNDED;
  }

  canTransitionTo(newStatus: PaymentStatus): boolean {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [
        PaymentStatus.PROCESSING,
        PaymentStatus.CANCELLED,
      ],
      [PaymentStatus.PROCESSING]: [
        PaymentStatus.COMPLETED,
        PaymentStatus.FAILED,
      ],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
      [PaymentStatus.CANCELLED]: [PaymentStatus.PENDING],
      [PaymentStatus.REFUNDED]: [],
    };

    return validTransitions[this.value].includes(newStatus);
  }
}
