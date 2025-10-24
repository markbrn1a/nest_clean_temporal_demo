import { Payment } from '../../domain/entities/payment.entity';

export interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Payment> | Payment;
  findById(id: string): Promise<Payment | null> | Payment | null;
  findByUserId(userId: string): Promise<Payment[]> | Payment[];
  findByCustomerId(customerId: string): Promise<Payment[]> | Payment[];
  findAll(): Promise<Payment[]> | Payment[];
  delete(id: string): Promise<void> | void;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
