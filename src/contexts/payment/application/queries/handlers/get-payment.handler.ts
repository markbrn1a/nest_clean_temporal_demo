import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentQuery } from '../get-payment.query';
import { Payment } from '../../../domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../../ports/payment.repository.port';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(query: GetPaymentQuery): Promise<Payment | null> {
    const { id } = query;
    return await this.paymentRepository.findById(id);
  }
}
