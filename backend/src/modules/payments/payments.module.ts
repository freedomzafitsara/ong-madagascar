// backend/src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PayPalSandboxService } from './paypal-sandbox.service';

@Module({
  controllers: [PaymentsController],
  providers: [PayPalSandboxService],
  exports: [PayPalSandboxService],
})
export class PaymentsModule {}