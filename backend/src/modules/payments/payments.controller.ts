// backend/src/modules/payments/payments.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Res } from '@nestjs/common';
import { PayPalSandboxService } from './paypal-sandbox.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paypalSandboxService: PayPalSandboxService) {}

  @Public()
  @Get('paypal/credentials')
  async getTestCredentials() {
    return this.paypalSandboxService.getTestCredentials();
  }

  @Post('paypal/create-order')
  @UseGuards(JwtAuthGuard)
  async createPayPalOrder(
    @Body() body: { amount: number; currency?: string },
    @CurrentUser() user: any,
  ) {
    const order = await this.paypalSandboxService.createDonationOrder(
      body.amount,
      body.currency || 'EUR'
    );

    return {
      success: true,
      orderId: order.id,
      approvalUrl: order.links?.find((l: any) => l.rel === 'approve')?.href,
      message: 'Don PayPal en mode sandbox - Aucun argent réel ne sera débité'
    };
  }

  @Post('paypal/capture-order/:orderId')
  @UseGuards(JwtAuthGuard)
  async capturePayPalOrder(@Param('orderId') orderId: string) {
    const capture = await this.paypalSandboxService.captureDonation(orderId);
    return { success: true, capture };
  }

  @Public()
  @Get('paypal/success')
  async success(@Res() res: Response) {
    return res.send(`
      <html>
        <head><title>Don réussi - Y-Mad</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: green;">✓ Don effectué avec succès !</h1>
          <p>Merci pour votre générosité.</p>
          <p style="font-size: 12px; color: gray;">Mode Sandbox - Aucun argent réel n'a été débité.</p>
          <a href="/" style="background: blue; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Retour à l'accueil</a>
        </body>
      </html>
    `);
  }

  @Public()
  @Get('paypal/cancel')
  async cancel(@Res() res: Response) {
    return res.send(`
      <html>
        <head><title>Don annulé - Y-Mad</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: orange;">⚠ Don annulé</h1>
          <p>Vous avez annulé le don. Aucun montant n'a été débité.</p>
          <a href="/donate" style="background: blue; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réessayer</a>
        </body>
      </html>
    `);
  }
}