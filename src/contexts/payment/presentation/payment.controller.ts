import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '../application/commands/create-payment.command';
import { UpdatePaymentCommand } from '../application/commands/update-payment.command';
import { DeletePaymentCommand } from '../application/commands/delete-payment.command';
import { GetPaymentQuery } from '../application/queries/get-payment.query';
import { ListPaymentsQuery } from '../application/queries/list-payments.query';
import { Payment } from '../domain/entities/payment.entity';
import { StartPaymentProcessingEvent } from '../domain/events/start-payment-processing.event';

export interface ProcessPaymentDto {
  userId: string;
  customerId?: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface CreatePaymentDto {
  userId: string;
  amount: number;
  currency?: string;
  customerId?: string;
  description?: string;
}

export interface UpdatePaymentDto {
  status?: string;
  description?: string;
}

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @Post()
  async createPayment(@Body() request: CreatePaymentDto) {
    const command = new CreatePaymentCommand(
      request.userId,
      request.amount,
      request.currency || 'USD',
      request.customerId,
      request.description,
    );
    const payment = await this.commandBus.execute<
      CreatePaymentCommand,
      Payment
    >(command);
    return this.mapPaymentToResponse(payment);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    const query = new GetPaymentQuery(id);
    const payment = await this.queryBus.execute<
      GetPaymentQuery,
      Payment | null
    >(query);

    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.mapPaymentToResponse(payment);
  }

  @Get()
  async listPayments(
    @Query('userId') userId?: string,
    @Query('customerId') customerId?: string,
  ) {
    const query = new ListPaymentsQuery(userId, customerId);
    const payments = await this.queryBus.execute<ListPaymentsQuery, Payment[]>(
      query,
    );
    return payments.map((payment) => this.mapPaymentToResponse(payment));
  }

  @Patch(':id')
  async updatePayment(
    @Param('id') id: string,
    @Body() request: UpdatePaymentDto,
  ) {
    const command = new UpdatePaymentCommand(
      id,
      request.status,
      request.description,
    );
    const payment = await this.commandBus.execute<
      UpdatePaymentCommand,
      Payment
    >(command);
    return this.mapPaymentToResponse(payment);
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    const command = new DeletePaymentCommand(id);
    await this.commandBus.execute(command);
    return { message: 'Payment deleted successfully' };
  }

  @Post('process')
  async processPayment(@Body() request: ProcessPaymentDto) {
    const eventId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Publish domain event to trigger payment processing workflow via saga
    await this.eventBus.publish(
      new StartPaymentProcessingEvent(
        request.userId,
        request.customerId,
        request.amount,
        request.currency,
        request.description,
      ),
    );

    return {
      eventId,
      status: 'processing_started',
      message:
        'Payment processing event published. The payment workflow will be triggered by the saga.',
    };
  }

  private mapPaymentToResponse(payment: Payment) {
    return {
      id: payment.getId().getValue(),
      userId: payment.getUserId().getValue(),
      customerId: payment.getCustomerId()?.getValue(),
      amount: payment.getAmount().getValue(),
      currency: payment.getCurrency().getValue(),
      status: payment.getStatus().getValue(),
      description: payment.getDescription(),
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };
  }
}
