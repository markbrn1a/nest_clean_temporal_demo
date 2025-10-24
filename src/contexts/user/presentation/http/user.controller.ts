import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { DeleteUserCommand } from '../../application/commands/delete-user.command';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { ListUsersQuery } from '../../application/queries/list-users.query';
import { CreateUserWithAddressEvent } from '../../domain/events/create-user-with-address.event';
import { User } from '../../domain/entities/user.entity';

export interface CreateUserDto {
  name: string;
  email: string;
  addressId?: string;
}

export interface CreateUserWithAddressDto {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  addressId?: string;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  @Post()
  async createUser(@Body() request: CreateUserDto) {
    const command = new CreateUserCommand(
      request.name,
      request.email,
      request.addressId,
    );
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      command,
    );
    return this.mapUserToResponse(user);
  }

  @Post('with-address')
  async createUserWithAddress(@Body() request: CreateUserWithAddressDto) {
    // Trigger the saga by publishing the event
    this.eventBus.publish(
      new CreateUserWithAddressEvent(
        request.name,
        request.email,
        request.address,
      ),
    );

    return { message: 'User with address creation initiated' };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const query = new GetUserQuery(id);
    const user = await this.queryBus.execute<GetUserQuery, User | null>(query);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapUserToResponse(user);
  }

  @Get()
  async listUsers() {
    const query = new ListUsersQuery();
    const users = await this.queryBus.execute<ListUsersQuery, User[]>(query);
    return users.map((user) => this.mapUserToResponse(user));
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const command = new UpdateUserCommand(
      id,
      body.name,
      body.email,
      body.addressId,
    );
    const user = await this.commandBus.execute<UpdateUserCommand, User>(
      command,
    );
    return this.mapUserToResponse(user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const command = new DeleteUserCommand(id);
    await this.commandBus.execute<DeleteUserCommand, void>(command);
  }

  private mapUserToResponse(user: User) {
    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      addressId: user.getAddressId()?.getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      accountAge: user.getAccountAge(),
    };
  }
}
