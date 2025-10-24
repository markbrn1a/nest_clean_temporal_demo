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
import { CreateCustomerCommand } from '../../application/commands/create-customer.command';
import { UpdateCustomerCommand } from '../../application/commands/update-customer.command';
import { DeleteCustomerCommand } from '../../application/commands/delete-customer.command';
import { GetCustomerQuery } from '../../application/queries/get-customer.query';
import { ListCustomersQuery } from '../../application/queries/list-customers.query';
import { CreateCustomerWithAddressEvent } from '../../domain/events/create-customer-with-address.event';
import { Customer } from '../../domain/entities/customer.entity';

export interface CreateCustomerDto {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  addressId?: string;
}

export interface CreateCustomerWithAddressDto {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface UpdateCustomerDto {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  addressId?: string;
}

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @Post()
  async createCustomer(@Body() request: CreateCustomerDto) {
    const command = new CreateCustomerCommand(
      request.userId,
      request.companyName,
      request.contactName,
      request.email,
      request.phone,
      request.addressId,
    );
    const customer = await this.commandBus.execute<
      CreateCustomerCommand,
      Customer
    >(command);
    return this.mapCustomerToResponse(customer);
  }

  @Post('with-address')
  async createCustomerWithAddress(
    @Body() request: CreateCustomerWithAddressDto,
  ) {
    // Trigger the saga by publishing the event
    this.eventBus.publish(
      new CreateCustomerWithAddressEvent(
        request.userId,
        request.companyName,
        request.contactName,
        request.email,
        request.phone,
        request.address,
      ),
    );

    return { message: 'Customer with address creation initiated' };
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    const query = new GetCustomerQuery(id);
    const customer = await this.queryBus.execute<
      GetCustomerQuery,
      Customer | null
    >(query);

    if (!customer) {
      throw new Error('Customer not found');
    }

    return this.mapCustomerToResponse(customer);
  }

  @Get()
  async listCustomers(@Query('userId') userId?: string) {
    const query = new ListCustomersQuery(userId);
    const customers = await this.queryBus.execute<
      ListCustomersQuery,
      Customer[]
    >(query);
    return customers.map((customer) => this.mapCustomerToResponse(customer));
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() request: UpdateCustomerDto,
  ) {
    const command = new UpdateCustomerCommand(
      id,
      request.companyName,
      request.contactName,
      request.email,
      request.phone,
      request.addressId,
    );
    const customer = await this.commandBus.execute<
      UpdateCustomerCommand,
      Customer
    >(command);
    return this.mapCustomerToResponse(customer);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    const command = new DeleteCustomerCommand(id);
    await this.commandBus.execute(command);
    return { message: 'Customer deleted successfully' };
  }

  private mapCustomerToResponse(customer: Customer) {
    return {
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
  }
}
