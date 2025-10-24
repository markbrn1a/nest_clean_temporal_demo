import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePaymentCommand } from '../create-payment.command';
import { Payment } from '../../../domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../../ports/payment.repository.port';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements ICommandHandler<CreatePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<Payment> {
    const { userId, amount, currency, customerId, description } = command;

    // Validate amount
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    // Create new payment
    const payment = Payment.create(
      userId,
      amount,
      currency,
      customerId,
      description,
    );

    return await this.paymentRepository.save(payment);
  }
}
