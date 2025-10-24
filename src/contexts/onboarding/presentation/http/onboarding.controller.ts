import { Body, Controller, Post, Inject } from '@nestjs/common';
import {
  type DomainEventBus,
  DOMAIN_EVENT_BUS,
} from '../../../../shared/integration/domain-event-bus.interface';
import { UserOnboardingRequestedEvent } from '../../domain/events/user-onboarding-requested.event';

export interface OnboardUserDto {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

@Controller('onboarding')
export class OnboardingController {
  constructor(
    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,
  ) {}

  @Post('user')
  async onboardUser(
    @Body() request: OnboardUserDto,
  ): Promise<{ message: string; requestId: string }> {
    const requestId = `user-onboarding-${Date.now()}-${request.email.replace('@', '-at-')}`;

    try {
      // Emit domain event for user onboarding request
      const event = new UserOnboardingRequestedEvent(requestId, {
        name: request.name,
        email: request.email,
        phone: request.phone,
        companyName: request.companyName || `${request.name}'s Company`,
        address: request.address,
      });

      await this.eventBus.publish(event);

      return {
        message: 'User onboarding request submitted successfully',
        requestId,
      };
    } catch (error) {
      console.error('Failed to submit onboarding request:', error);
      throw new Error('Failed to submit onboarding request');
    }
  }
}
