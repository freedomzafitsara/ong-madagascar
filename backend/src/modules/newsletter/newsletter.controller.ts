import { Controller, Post, Body, Delete, Get, Query } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    const subscriber = await this.newsletterService.subscribe(subscribeDto);
    return {
      message: 'Abonnement réussi',
      email: subscriber.email,
    };
  }

  @Delete('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    await this.newsletterService.unsubscribe(email);
    return { message: 'Désabonnement réussi' };
  }

  @Get('subscribers')
  async getAllSubscribers() {
    return this.newsletterService.findAll();
  }

  @Get('count')
  async getCount() {
    const count = await this.newsletterService.countSubscribers();
    return { count };
  }
}
