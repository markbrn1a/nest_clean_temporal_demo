import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeletePaymentCommand } from '../delete-payment.command';
import {
  PAYMENT_REPOSITORY,
  PaymentRepositoryPort,
} from '../../ports/payment.repository.port';

@CommandHandler(DeletePaymentCommand)
export class DeletePaymentHandler
  implements ICommandHandler<DeletePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(command: DeletePaymentCommand): Promise<void> {
    const { id } = command;

    // Check if payment exists
    const existingPayment = await this.paymentRepository.findById(id);
    if (!existingPayment) {
      throw new Error('Payment not found.');
    }

    // Check if payment can be deleted (e.g., only pending payments)
    if (!existingPayment.isCancellable()) {
      throw new Error(
        'Payment cannot be deleted. Only pending payments can be deleted.',
      );
    }

    // Delete the payment
    await this.paymentRepository.delete(id);
  }
}
