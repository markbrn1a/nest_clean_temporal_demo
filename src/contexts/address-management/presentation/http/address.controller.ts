import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAddressCommand } from '../../application/commands/create-address.command';
import { UpdateAddressCommand } from '../../application/commands/update-address.command';
import { DeleteAddressCommand } from '../../application/commands/delete-address.command';
import { GetAddressQuery } from '../../application/queries/get-address.query';
import { ListAddressesQuery } from '../../application/queries/list-addresses.query';
import { Address } from '../../domain/entities/address.entity';

export interface CreateAddressDto {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface UpdateAddressDto {
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

@Controller('addresses')
export class AddressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createAddress(@Body() request: CreateAddressDto) {
    const command = new CreateAddressCommand(
      request.street,
      request.city,
      request.zipCode,
      request.country,
    );
    const addressId = await this.commandBus.execute<
      CreateAddressCommand,
      string
    >(command);
    return { id: addressId, message: 'Address created successfully' };
  }

  @Get(':id')
  async getAddress(@Param('id') id: string) {
    const query = new GetAddressQuery(id);
    const address = await this.queryBus.execute<
      GetAddressQuery,
      Address | null
    >(query);

    if (!address) {
      throw new Error('Address not found');
    }

    return this.mapAddressToResponse(address);
  }

  @Get()
  async listAddresses() {
    const query = new ListAddressesQuery();
    const addresses = await this.queryBus.execute<
      ListAddressesQuery,
      Address[]
    >(query);
    return addresses.map((address) => this.mapAddressToResponse(address));
  }

  @Patch(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() request: UpdateAddressDto,
  ) {
    const command = new UpdateAddressCommand(
      id,
      request.street,
      request.city,
      request.zipCode,
      request.country,
    );
    const address = await this.commandBus.execute<
      UpdateAddressCommand,
      Address
    >(command);
    return this.mapAddressToResponse(address);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string) {
    const command = new DeleteAddressCommand(id);
    await this.commandBus.execute(command);
    return { message: 'Address deleted successfully' };
  }

  private mapAddressToResponse(address: Address) {
    return {
      id: address.getId().getValue(),
      street: address.getStreet().getValue(),
      city: address.getCity().getValue(),
      zipCode: address.getZipCode().getValue(),
      country: address.getCountry().getValue(),
      fullAddress: address.getFullAddress(),
      createdAt: address.getCreatedAt(),
      updatedAt: address.getUpdatedAt(),
    };
  }
}
