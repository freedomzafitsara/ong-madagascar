import { Controller, Get, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.membersService.findByUser(userId);
  }

  @Post('generate/:userId')
  generateCard(@Param('userId') userId: string) {
    return this.membersService.generateMemberCard(userId);
  }

  @Post('renew/:id')
  renew(@Param('id') id: string) {
    return this.membersService.renewMembership(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}