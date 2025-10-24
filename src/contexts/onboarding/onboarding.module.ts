import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OnboardingController } from './presentation/http/onboarding.controller';
import { TemporalModule } from '../../infrastructure/temporal/temporal.module';
import { IntegrationModule } from '../../shared/integration/integration.module';
import { OnboardingSaga } from '../../shared/integration/sagas/onboarding.saga';

@Module({
  imports: [CqrsModule, TemporalModule, IntegrationModule],
  controllers: [OnboardingController],
  providers: [OnboardingSaga],
  exports: [],
})
export class OnboardingModule {}
