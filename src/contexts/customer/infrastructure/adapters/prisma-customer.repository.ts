import { Injectable } from '@nestjs/common';
import { CustomerRepositoryPort } from '../../application/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<void> {
    const data = {
      id: customer.getId().getValue(),
      userId: customer.getUserId().getValue(),
      companyName: customer.getCompanyName().getValue(),
      contactName: customer.getContactName().getValue(),
      email: customer.getEmail().getValue(),
      phone: customer.getPhone(),
      addressId: customer.getAddressId()?.getValue(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };

    await this.prisma.customer.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: id.getValue() },
    });

    if (!customer) {
      return null;
    }

    return Customer.fromPersistence(
      customer.id,
      customer.userId,
      customer.companyName,
      customer.contactName,
      customer.email,
      customer.phone,
      customer.addressId,
      customer.createdAt,
      customer.updatedAt,
    );
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany();

    return customers.map((customer) =>
      Customer.fromPersistence(
        customer.id,
        customer.userId,
        customer.companyName,
        customer.contactName,
        customer.email,
        customer.phone,
        customer.addressId,
        customer.createdAt,
        customer.updatedAt,
      ),
    );
  }

  async findByUserId(userId: string): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: { userId },
    });

    return customers.map((customer) =>
      Customer.fromPersistence(
        customer.id,
        customer.userId,
        customer.companyName,
        customer.contactName,
        customer.email,
        customer.phone,
        customer.addressId,
        customer.createdAt,
        customer.updatedAt,
      ),
    );
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { email },
    });

    if (!customer) {
      return null;
    }

    return Customer.fromPersistence(
      customer.id,
      customer.userId,
      customer.companyName,
      customer.contactName,
      customer.email,
      customer.phone,
      customer.addressId,
      customer.createdAt,
      customer.updatedAt,
    );
  }

  async delete(id: CustomerId): Promise<void> {
    await this.prisma.customer.delete({
      where: { id: id.getValue() },
    });
  }
}
