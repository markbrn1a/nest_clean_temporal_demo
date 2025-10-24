import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPaymentsQuery } from '../list-payments.query';
import { Payment } from '../../../domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  type PaymentRepositoryPort,
} from '../../ports/payment.repository.port';

@QueryHandler(ListPaymentsQuery)
export class ListPaymentsHandler implements IQueryHandler<ListPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(query: ListPaymentsQuery): Promise<Payment[]> {
    const { userId, customerId } = query;

    if (userId) {
      return await this.paymentRepository.findByUserId(userId);
    }

    if (customerId) {
      return await this.paymentRepository.findByCustomerId(customerId);
    }

    return await this.paymentRepository.findAll();
  }
}
