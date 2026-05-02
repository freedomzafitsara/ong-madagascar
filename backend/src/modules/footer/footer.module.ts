import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FooterController } from './footer.controller';
import { FooterService } from './footer.service';
import { FooterSection } from './entities/footer-section.entity';
import { FooterLink } from './entities/footer-link.entity';
import { FooterContact } from './entities/footer-contact.entity';
import { FooterLegalLink } from './entities/footer-legal-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FooterSection,
      FooterLink,
      FooterContact,
      FooterLegalLink,
    ]),
  ],
  controllers: [FooterController],
  providers: [FooterService],
  exports: [FooterService],
})
export class FooterModule {}