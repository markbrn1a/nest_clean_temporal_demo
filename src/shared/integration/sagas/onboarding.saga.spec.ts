import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { OnboardingSaga } from './onboarding.saga';
import { TemporalService } from '../../../infrastructure/temporal/temporal.service';
import { UserOnboardingRequestedEvent } from '../../../contexts/onboarding/domain/events/user-onboarding-requested.event';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

describe('OnboardingSaga', () => {
  let saga: OnboardingSaga;
  let temporalService: jest.Mocked<TemporalService>;

  const mockUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    companyName: 'Tech Corp',
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
      country: 'USA',
    },
  };

  beforeEach(async () => {
    const mockTemporalService = {
      startWorkflow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingSaga,
        {
          provide: TemporalService,
          useValue: mockTemporalService,
        },
      ],
    }).compile();

    saga = module.get<OnboardingSaga>(OnboardingSaga);
    temporalService = module.get(TemporalService);
  });

  describe('userOnboardingRequested', () => {
    it('should handle UserOnboardingRequestedEvent and start workflow', async () => {
      // Arrange
      const requestId = 'test-request-123';
      const event = new UserOnboardingRequestedEvent(requestId, mockUserData);
      const events$ = of(event);

      temporalService.startWorkflow.mockResolvedValue('workflow-id-123');

      // Act
      const result$ = saga.userOnboardingRequested(events$);

      // Assert
      result$.subscribe();

      // Give a small delay for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(temporalService.startWorkflow).toHaveBeenCalledWith(
        'userOnboardingWorkflow',
        {
          workflowId: `user-onboarding-${requestId}`,
          taskQueue: 'main-task-queue',
          args: [mockUserData],
        },
      );
    });

    it('should handle workflow already started error gracefully', async () => {
      // Arrange
      const requestId = 'test-request-123';
      const event = new UserOnboardingRequestedEvent(requestId, mockUserData);
      const events$ = of(event);

      const workflowError = new Error('Workflow execution already started');
      temporalService.startWorkflow.mockRejectedValue(workflowError);

      // Spy on console.log to verify error handling
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      const result$ = saga.userOnboardingRequested(events$);

      // Assert
      result$.subscribe();

      // Give a small delay for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith(
        'OnboardingSaga: Workflow already started, skipping',
        expect.objectContaining({
          requestId,
          workflowId: `user-onboarding-${requestId}`,
        }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle other temporal errors', async () => {
      // Arrange
      const requestId = 'test-request-123';
      const event = new UserOnboardingRequestedEvent(requestId, mockUserData);
      const events$ = of(event);

      const unexpectedError = new Error('Some other temporal error');
      temporalService.startWorkflow.mockRejectedValue(unexpectedError);

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result$ = saga.userOnboardingRequested(events$);

      // Assert
      result$.subscribe();

      // Give a small delay for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OnboardingSaga: Failed to start Temporal workflow',
        expect.objectContaining({
          requestId,
          error: 'Some other temporal error',
        }),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
