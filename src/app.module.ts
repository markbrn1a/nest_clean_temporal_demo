import { Module } from '@nestjs/common';
import { UserModule } from './contexts/user/user.module';
import { TemporalModule } from './infrastructure/temporal/temporal.module';
import { EmailModule } from './infrastructure/email/email.module';
import { CustomerModule } from './contexts/customer/customer.module';
import { PaymentModule } from './contexts/payment/payment.module';
import { AddressManagementModule } from './contexts/address-management/address-management.module';
import { OnboardingModule } from './contexts/onboarding/onboarding.module';
import { IntegrationModule } from './shared/integration/integration.module';

@Module({
  imports: [
    UserModule,
    TemporalModule,
    EmailModule,
    CustomerModule,
    PaymentModule,
    AddressManagementModule,
    OnboardingModule,
    IntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
