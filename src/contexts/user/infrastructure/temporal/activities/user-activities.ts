import { Context } from '@temporalio/activity';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Address } from '../../../../address-management/domain/entities/address.entity';
import { User } from '../../../domain/entities/user.entity';
import { Customer } from '../../../../customer/domain/entities/customer.entity';

export interface ValidateUserDataInput {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateAddressInput {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  addressId: string;
}

export interface CreateCustomerInput {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  addressId: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

// Helper function to create Prisma service
function createPrismaService() {
  return new PrismaService();
}

export async function validateUserData(
  input: ValidateUserDataInput,
): Promise<void> {
  Context.current().log.info('Validating user data', { input });

  // Validate user data
  if (!input.name || input.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }

  if (!input.email || !input.email.includes('@')) {
    throw new Error('Valid email is required');
  }

  if (
    !input.address.street ||
    !input.address.city ||
    !input.address.zipCode ||
    !input.address.country
  ) {
    throw new Error('Complete address information is required');
  }

  Context.current().log.info('User data validation completed');
}

export async function createAddress(
  input: CreateAddressInput,
): Promise<string> {
  Context.current().log.info('Creating address', { input });

  const prisma = createPrismaService();

  // Create address using domain entity
  const address = Address.create(
    input.street,
    input.city,
    input.zipCode,
    input.country,
  );

  // Save to database
  await prisma.address.create({
    data: {
      id: address.getId().getValue(),
      street: address.getStreet().getValue(),
      city: address.getCity().getValue(),
      zipCode: address.getZipCode().getValue(),
      country: address.getCountry().getValue(),
      createdAt: address.getCreatedAt(),
      updatedAt: address.getUpdatedAt(),
    },
  });

  const addressId = address.getId().getValue();
  Context.current().log.info('Address created', { addressId });
  return addressId;
}

export async function createUser(input: CreateUserInput): Promise<string> {
  Context.current().log.info('Creating user', { input });

  const prisma = createPrismaService();

  // Create user using domain entity
  const user = User.create(input.name, input.email, input.addressId);

  // Save to database
  await prisma.user.create({
    data: {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      addressId: user.getAddressId()?.getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    },
  });

  const userId = user.getId().getValue();
  Context.current().log.info('User created', { userId });
  return userId;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<string> {
  Context.current().log.info('Creating customer', { input });

  const prisma = createPrismaService();

  // Create customer using domain entity
  const customer = Customer.create(
    input.userId,
    input.companyName,
    input.contactName,
    input.email,
    input.phone,
    input.addressId,
  );

  // Save to database
  await prisma.customer.create({
    data: {
      id: customer.getId().getValue(),
      userId: customer.getUserId().getValue(),
      companyName: customer.getCompanyName().getValue(),
      contactName: customer.getContactName().getValue(),
      email: customer.getEmail().getValue(),
      phone: customer.getPhone(),
      addressId: customer.getAddressId()?.getValue(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    },
  });

  const customerId = customer.getId().getValue();
  Context.current().log.info('Customer created', { customerId });
  return customerId;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  Context.current().log.info('Sending email', {
    to: input.to,
    subject: input.subject,
  });

  // For demo purposes, just log the email
  // In production, this would integrate with an actual email service
  console.log(`📧 EMAIL SENT:`);
  console.log(`   To: ${input.to}`);
  console.log(`   Subject: ${input.subject}`);
  console.log(`   Body: ${input.body}`);

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  Context.current().log.info('Email sent successfully');
}
