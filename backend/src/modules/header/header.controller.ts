import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { HeaderService } from './header.service';

@Controller('api/header')
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

  @Get()
  async getHeaderData() {
    return this.headerService.getHeaderData();
  }

  @Put('setting/:key')
  async updateSetting(@Param('key') key: string, @Body() body: any) {
    return this.headerService.updateHeaderSetting(key, body.value);
  }

  @Put('nav/:id')
  async updateNavLink(@Param('id') id: string, @Body() body: any) {
    return this.headerService.updateNavLink(id, body);
  }
}