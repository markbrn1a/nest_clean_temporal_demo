import { Injectable } from '@nestjs/common';
import { PaymentRepositoryPort } from '../../application/ports/payment.repository.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo';
import { PaymentStatus as PrismaPaymentStatus } from '@prisma/client';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private convertPrismaStatusToDomain(
    prismaStatus: PrismaPaymentStatus,
  ): PaymentStatus {
    switch (prismaStatus) {
      case 'PENDING':
        return PaymentStatus.PENDING;
      case 'PROCESSING':
        return PaymentStatus.PROCESSING;
      case 'COMPLETED':
        return PaymentStatus.COMPLETED;
      case 'FAILED':
        return PaymentStatus.FAILED;
      case 'CANCELLED':
        return PaymentStatus.CANCELLED;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      default:
        throw new Error(`Unknown payment status: ${prismaStatus}`);
    }
  }

  async save(payment: Payment): Promise<Payment> {
    const paymentData = {
      id: payment.getId().getValue(),
      userId: payment.getUserId().getValue(),
      customerId: payment.getCustomerId()?.getValue() || null,
      amount: payment.getAmount().getValue(),
      currency: payment.getCurrency().getValue(),
      status: payment.getStatus().getValue(),
      description: payment.getDescription() || null,
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };

    const existingPayment = await this.prisma.payment.findUnique({
      where: { id: paymentData.id },
    });

    let savedPayment;
    if (existingPayment) {
      savedPayment = await this.prisma.payment.update({
        where: { id: paymentData.id },
        data: {
          status: paymentData.status,
          description: paymentData.description,
          updatedAt: paymentData.updatedAt,
        },
      });
    } else {
      savedPayment = await this.prisma.payment.create({
        data: paymentData,
      });
    }

    return Payment.fromPersistence(
      savedPayment.id,
      savedPayment.userId,
      savedPayment.customerId,
      savedPayment.amount,
      savedPayment.currency,
      this.convertPrismaStatusToDomain(savedPayment.status),
      savedPayment.description,
      savedPayment.createdAt,
      savedPayment.updatedAt,
    );
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return null;
    }

    return Payment.fromPersistence(
      payment.id,
      payment.userId,
      payment.customerId,
      payment.amount,
      payment.currency,
      this.convertPrismaStatusToDomain(payment.status),
      payment.description,
      payment.createdAt,
      payment.updatedAt,
    );
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) =>
      Payment.fromPersistence(
        payment.id,
        payment.userId,
        payment.customerId,
        payment.amount,
        payment.currency,
        this.convertPrismaStatusToDomain(payment.status),
        payment.description,
        payment.createdAt,
        payment.updatedAt,
      ),
    );
  }

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) =>
      Payment.fromPersistence(
        payment.id,
        payment.userId,
        payment.customerId,
        payment.amount,
        payment.currency,
        this.convertPrismaStatusToDomain(payment.status),
        payment.description,
        payment.createdAt,
        payment.updatedAt,
      ),
    );
  }

  async findAll(): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) =>
      Payment.fromPersistence(
        payment.id,
        payment.userId,
        payment.customerId,
        payment.amount,
        payment.currency,
        this.convertPrismaStatusToDomain(payment.status),
        payment.description,
        payment.createdAt,
        payment.updatedAt,
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }
}
