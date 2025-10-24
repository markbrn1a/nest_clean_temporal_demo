import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EMAIL_SERVICE } from './email.service.interface';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
