import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomerSaga } from './sagas/customer.saga';
import { UserSaga } from './sagas/user.saga';
import { OnboardingSaga } from './sagas/onboarding.saga';
import { TemporalModule } from '../../infrastructure/temporal/temporal.module';
import { PaymentSaga } from './sagas/payment.saga';
import { DOMAIN_EVENT_BUS } from './domain-event-bus.interface';
import { NestDomainEventBus } from './nest-domain-event-bus';

@Module({
  imports: [CqrsModule, TemporalModule],
  providers: [
    CustomerSaga,
    UserSaga,
    OnboardingSaga,
    PaymentSaga,
    {
      provide: DOMAIN_EVENT_BUS,
      useClass: NestDomainEventBus,
    },
  ],
  exports: [
    CustomerSaga,
    UserSaga,
    OnboardingSaga,
    PaymentSaga,
    DOMAIN_EVENT_BUS,
  ],
})
export class IntegrationModule {}
