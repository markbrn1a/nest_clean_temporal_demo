import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/customer-activities';

const { validateCustomerData, createCustomerForUser, sendCustomerEmail } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
  });

export interface CreateCustomerInput {
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  addressId: string;
}

export interface CreateCustomerResult {
  customerId: string;
  status: 'completed' | 'failed';
  error?: string;
}

export async function createCustomerWorkflow(
  input: CreateCustomerInput,
): Promise<CreateCustomerResult> {
  try {
    // Step 1: Validate customer data
    await validateCustomerData(input);

    // Step 2: Create customer
    const customerId = await createCustomerForUser({
      userId: input.userId,
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      addressId: input.addressId,
    });

    // Step 3: Send customer creation email
    await sendCustomerEmail({
      email: input.email,
      contactName: input.contactName,
      companyName: input.companyName,
    });

    return {
      customerId,
      status: 'completed',
    };
  } catch (error) {
    return {
      customerId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
