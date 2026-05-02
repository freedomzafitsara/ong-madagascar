import { Controller, Get, Post, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberStatusDto } from './dto/create-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMembership(@CurrentUser() user: any, @Body() createMemberDto: CreateMemberDto) {
    return this.membersService.createMembership(user.id, createMemberDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyMembership(@CurrentUser() user: any) {
    return this.membersService.getMemberByUserId(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getMember(@Param('id') id: string) {
    return this.membersService.getMemberById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllMembers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.membersService.getAllMembers(page, limit, status);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateMemberStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateMemberStatusDto) {
    return this.membersService.updateMemberStatus(id, updateStatusDto.status);
  }

  @Get('stats/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStats() {
    return this.membersService.getStats();
  }

  @Public()
  @Get('card/:memberNumber')
  async getMemberCard(@Param('memberNumber') memberNumber: string) {
    return this.membersService.getMemberCard(memberNumber);
  }
}