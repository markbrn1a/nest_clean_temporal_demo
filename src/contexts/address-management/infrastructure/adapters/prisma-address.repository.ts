import { Injectable } from '@nestjs/common';
import { AddressRepositoryPort } from '../../application/ports/address.repository.port';
import { Address } from '../../domain/entities/address.entity';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaAddressRepository implements AddressRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(address: Address): Promise<Address> {
    const addressData = {
      id: address.getId().getValue(),
      street: address.getStreet().getValue(),
      city: address.getCity().getValue(),
      zipCode: address.getZipCode().getValue(),
      country: address.getCountry().getValue(),
      createdAt: address.getCreatedAt(),
      updatedAt: address.getUpdatedAt(),
    };

    const existingAddress = await this.prisma.address.findUnique({
      where: { id: addressData.id },
    });

    let savedAddress;
    if (existingAddress) {
      savedAddress = await this.prisma.address.update({
        where: { id: addressData.id },
        data: {
          street: addressData.street,
          city: addressData.city,
          zipCode: addressData.zipCode,
          country: addressData.country,
          updatedAt: addressData.updatedAt,
        },
      });
    } else {
      savedAddress = await this.prisma.address.create({
        data: addressData,
      });
    }

    return Address.fromPersistence(
      savedAddress.id,
      savedAddress.street,
      savedAddress.city,
      savedAddress.zipCode,
      savedAddress.country,
      savedAddress.createdAt,
      savedAddress.updatedAt,
    );
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return null;
    }

    return Address.fromPersistence(
      address.id,
      address.street,
      address.city,
      address.zipCode,
      address.country,
      address.createdAt,
      address.updatedAt,
    );
  }

  async findAll(): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return addresses.map((address) =>
      Address.fromPersistence(
        address.id,
        address.street,
        address.city,
        address.zipCode,
        address.country,
        address.createdAt,
        address.updatedAt,
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }
}
