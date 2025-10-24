import { Context } from '@temporalio/activity';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { Customer } from '../../../domain/entities/customer.entity';

export interface ValidateCustomerDataInput {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  addressId: string;
}

export interface CreateCustomerForUserInput {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  addressId: string;
}

export interface SendCustomerEmailInput {
  email: string;
  contactName: string;
  companyName: string;
}

// Helper function to create Prisma service
function createPrismaService() {
  return new PrismaService();
}

export async function validateCustomerData(
  input: ValidateCustomerDataInput,
): Promise<void> {
  Context.current().log.info('Validating customer data', { input });

  if (!input.userId) {
    throw new Error('User ID is required');
  }

  if (!input.companyName || input.companyName.trim().length < 2) {
    throw new Error('Company name must be at least 2 characters long');
  }

  if (!input.contactName || input.contactName.trim().length < 2) {
    throw new Error('Contact name must be at least 2 characters long');
  }

  if (!input.email || !input.email.includes('@')) {
    throw new Error('Valid email is required');
  }

  if (!input.addressId) {
    throw new Error('Address ID is required');
  }

  Context.current().log.info('Customer data validation completed');
}

export async function createCustomerForUser(
  input: CreateCustomerForUserInput,
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

export async function sendCustomerEmail(
  input: SendCustomerEmailInput,
): Promise<void> {
  Context.current().log.info('Sending customer welcome email', { input });

  // For demo purposes, just log the email
  console.log(`📧 CUSTOMER WELCOME EMAIL:`);
  console.log(`   To: ${input.email}`);
  console.log(`   Contact: ${input.contactName}`);
  console.log(`   Company: ${input.companyName}`);
  console.log(`   Subject: Welcome to our platform, ${input.companyName}!`);

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  Context.current().log.info('Customer welcome email sent');
}
