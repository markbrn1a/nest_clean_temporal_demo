import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PAYMENT_REPOSITORY } from './application/ports/payment.repository.port';
import { PaymentController } from './presentation/payment.controller';
import { TemporalPaymentController } from './presentation/temporal-payment.controller';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TemporalModule } from '../../infrastructure/temporal/temporal.module';

// Command Handlers
import { CreatePaymentHandler } from './application/commands/handlers/create-payment.handler';
import { UpdatePaymentHandler } from './application/commands/handlers/update-payment.handler';
import { DeletePaymentHandler } from './application/commands/handlers/delete-payment.handler';

// Query Handlers
import { GetPaymentHandler } from './application/queries/handlers/get-payment.handler';
import { ListPaymentsHandler } from './application/queries/handlers/list-payments.handler';

// Services
import { PaymentAggregateService } from './application/services/payment-aggregate.service';

import { PrismaPaymentRepository } from './infrastructure/adapters/prisma-payment.repository';

const CommandHandlers = [
  CreatePaymentHandler,
  UpdatePaymentHandler,
  DeletePaymentHandler,
];

const QueryHandlers = [GetPaymentHandler, ListPaymentsHandler];

@Module({
  imports: [CqrsModule, TemporalModule],
  controllers: [PaymentController, TemporalPaymentController],
  providers: [
    PrismaService,
    PaymentAggregateService,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
  ],
  exports: [PaymentAggregateService],
})
export class PaymentModule {}
