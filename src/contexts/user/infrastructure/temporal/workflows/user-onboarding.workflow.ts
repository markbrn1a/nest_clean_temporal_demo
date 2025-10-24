import { proxyActivities, executeChild } from '@temporalio/workflow';
import type * as activities from '../activities/user-activities';
import {
  createCustomerWorkflow,
  CreateCustomerInput,
} from '../../../../customer/infrastructure/temporal/workflows/create-customer.workflow';

const { validateUserData, createAddress, createUser, sendEmail } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
  });

export interface CreateUserWithAddressInput {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateUserWithAddressResult {
  userId: string;
  addressId: string;
  customerId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function userOnboardingWorkflow(
  input: CreateUserWithAddressInput,
): Promise<CreateUserWithAddressResult> {
  try {
    // Step 1: Validate data
    await validateUserData(input);

    // Step 2: Create address
    const addressId = await createAddress({
      street: input.address.street,
      city: input.address.city,
      zipCode: input.address.zipCode,
      country: input.address.country,
    });

    // Step 3: Create user with address
    const userId = await createUser({
      name: input.name,
      email: input.email,
      addressId,
    });

    // Step 4: Create customer (sub-workflow)
    const customerResult = await executeChild(createCustomerWorkflow, {
      args: [
        {
          userId,
          companyName: `${input.name} Company`, // Default company name
          contactName: input.name,
          email: input.email,
          addressId,
        },
      ],
      workflowId: `create-customer-${userId}-${Date.now()}`,
    });

    const customerId = customerResult.customerId;

    // Step 5: Send welcome email
    await sendEmail({
      to: input.email,
      subject: 'Welcome to our platform!',
      body: `Hello ${input.name}, welcome to our platform. Your account has been created successfully.`,
    });

    return {
      userId,
      addressId,
      customerId,
      status: 'completed',
    };
  } catch (error) {
    return {
      userId: '',
      addressId: '',
      customerId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
