// backend/src/modules/footer/footer.controller.ts
import { Controller, Get } from '@nestjs/common';
import { FooterService } from './footer.service';

@Controller('footer')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @Get()
  async getFooter() {
    return this.footerService.getFooterData();
  }
}