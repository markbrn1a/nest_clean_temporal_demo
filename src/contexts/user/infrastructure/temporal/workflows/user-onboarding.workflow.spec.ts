import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import {
  userOnboardingWorkflow,
  CreateUserWithAddressInput,
} from './user-onboarding.workflow';
import type * as activities from '../activities/user-activities';

describe('userOnboardingWorkflow', () => {
  let testEnv: TestWorkflowEnvironment;
  let worker: Worker | undefined;

  beforeAll(async () => {
    // Create test environment with longer timeout
    testEnv = await TestWorkflowEnvironment.createLocal();
  }, 60000); // 60 second timeout for setup

  afterEach(async () => {
    // Ensure worker is properly shut down after each test
    if (worker) {
      try {
        await worker.shutdown();
      } catch (error) {
        // Worker might already be stopped, that's okay
        console.warn('Worker shutdown warning:', error.message);
      }
      worker = undefined;
    }
  });

  afterAll(async () => {
    if (testEnv) {
      try {
        await testEnv.teardown();
      } catch (error) {
        console.warn('TestWorkflowEnvironment teardown failed:', error);
      }
    }
  }, 60000); // 60 second timeout for teardown

  it('should complete workflow successfully with valid input', async () => {
    // Arrange
    const mockActivities = {
      // User activities
      validateUserData: jest.fn().mockResolvedValue(undefined),
      createAddress: jest.fn().mockResolvedValue('address-123'),
      createUser: jest.fn().mockResolvedValue('user-123'),
      sendEmail: jest.fn().mockResolvedValue(undefined),
      // Customer activities for child workflow
      validateCustomerData: jest.fn().mockResolvedValue(undefined),
      createCustomerForUser: jest.fn().mockResolvedValue('customer-123'),
      sendCustomerEmail: jest.fn().mockResolvedValue(undefined),
    };

    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test-task-queue';

    worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      // Use the test workflow bundle that includes all needed workflows
      workflowsPath: require.resolve('./test-workflows'),
      activities: mockActivities,
    });

    const workflowInput: CreateUserWithAddressInput = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        country: 'USA',
      },
    };

    // Act
    const runPromise = worker.runUntil(async () => {
      const handle = await client.workflow.start(userOnboardingWorkflow, {
        args: [workflowInput],
        taskQueue,
        workflowId: 'test-workflow-' + Date.now(),
      });

      return await handle.result();
    });

    const result = await runPromise;

    // Assert
    expect(result).toEqual({
      userId: 'user-123',
      addressId: 'address-123',
      customerId: 'customer-123',
      status: 'completed',
    });

    expect(mockActivities.validateUserData).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john.doe@example.com',
      }),
    );

    expect(mockActivities.createAddress).toHaveBeenCalledWith({
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
      country: 'USA',
    });

    expect(mockActivities.createUser).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      addressId: 'address-123',
    });

    expect(mockActivities.createCustomerForUser).toHaveBeenCalledWith({
      userId: 'user-123',
      companyName: expect.any(String),
      contactName: 'John Doe',
      email: 'john.doe@example.com',
      addressId: 'address-123',
    });
  }, 30000); // 30 second timeout for successful workflow test

  it('should handle validation failure', async () => {
    // Arrange
    const mockActivities = {
      // User activities
      validateUserData: jest
        .fn()
        .mockRejectedValue(new Error('Invalid email format')),
      createAddress: jest.fn(),
      createUser: jest.fn(),
      sendEmail: jest.fn(),
      // Customer activities for child workflow
      validateCustomerData: jest.fn(),
      createCustomerForUser: jest.fn(),
      sendCustomerEmail: jest.fn(),
    };

    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test-task-queue-validation';

    worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      // Use the test workflow bundle that includes all needed workflows
      workflowsPath: require.resolve('./test-workflows'),
      activities: mockActivities,
    });

    const workflowInput: CreateUserWithAddressInput = {
      name: 'John Doe',
      email: 'invalid-email',
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        country: 'USA',
      },
    };

    // Act & Assert
    await expect(
      worker.runUntil(async () => {
        const handle = await client.workflow.start(userOnboardingWorkflow, {
          args: [workflowInput],
          taskQueue,
          workflowId: 'test-workflow-validation-' + Date.now(),
        });

        return await handle.result();
      }),
    ).rejects.toThrow('Invalid email format');

    expect(mockActivities.validateUserData).toHaveBeenCalled();
    expect(mockActivities.createAddress).not.toHaveBeenCalled();
    expect(mockActivities.createUser).not.toHaveBeenCalled();
    expect(mockActivities.createCustomerForUser).not.toHaveBeenCalled();
  }, 30000); // 30 second timeout
});
