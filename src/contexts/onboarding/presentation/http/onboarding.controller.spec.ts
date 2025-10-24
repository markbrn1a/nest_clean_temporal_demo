import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingController } from './onboarding.controller';
import {
  DomainEventBus,
  DOMAIN_EVENT_BUS,
} from '../../../../shared/integration/domain-event-bus.interface';
import { UserOnboardingRequestedEvent } from '../../domain/events/user-onboarding-requested.event';

describe('OnboardingController', () => {
  let controller: OnboardingController;
  let eventBus: jest.Mocked<DomainEventBus>;

  const mockOnboardUserDto = {
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
    const mockEventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        {
          provide: DOMAIN_EVENT_BUS,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    eventBus = module.get(DOMAIN_EVENT_BUS);
  });

  describe('onboardUser', () => {
    it('should publish UserOnboardingRequestedEvent and return success response', async () => {
      // Arrange
      eventBus.publish.mockResolvedValue();

      // Mock Date.now() for consistent requestId
      const mockTimestamp = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      // Act
      const result = await controller.onboardUser(mockOnboardUserDto);

      // Assert
      const expectedRequestId = `user-onboarding-${mockTimestamp}-john.doe-at-example.com`;

      expect(result).toEqual({
        message: 'User onboarding request submitted successfully',
        requestId: expectedRequestId,
      });

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expectedRequestId,
          userData: {
            ...mockOnboardUserDto,
            companyName: 'Tech Corp', // Should use provided company name
          },
          eventId: expect.any(String),
          aggregateId: expectedRequestId,
          eventType: 'UserOnboardingRequested',
          occurredOn: expect.any(Date),
          payload: expect.objectContaining({
            requestId: expectedRequestId,
            userData: expect.objectContaining({
              name: 'John Doe',
              email: 'john.doe@example.com',
            }),
          }),
        }),
      );

      // Restore Date.now()
      jest.restoreAllMocks();
    });

    it('should use default company name when not provided', async () => {
      // Arrange
      eventBus.publish.mockResolvedValue();
      const dtoWithoutCompany = {
        name: mockOnboardUserDto.name,
        email: mockOnboardUserDto.email,
        phone: mockOnboardUserDto.phone,
        address: mockOnboardUserDto.address,
      };

      // Mock Date.now() for consistent requestId
      const mockTimestamp = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      // Act
      const result = await controller.onboardUser(dtoWithoutCompany);

      // Assert
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userData: expect.objectContaining({
            companyName: "John Doe's Company", // Should use default pattern
          }),
        }),
      );

      // Restore Date.now()
      jest.restoreAllMocks();
    });

    it('should handle eventBus publish errors', async () => {
      // Arrange
      const publishError = new Error('EventBus connection failed');
      eventBus.publish.mockRejectedValue(publishError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(controller.onboardUser(mockOnboardUserDto)).rejects.toThrow(
        'Failed to submit onboarding request',
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to submit onboarding request:',
        publishError,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
