import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Put,
  NotFoundException   // ← AJOUT OBLIGATOIRE (c'était l'erreur)
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageContentDto, UpdatePageContentDto } from './dto/create-page-content.dto';
import { CreatePageBackgroundDto, UpdatePageBackgroundDto } from './dto/create-page-background.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // ========== CONTENUS DES PAGES ==========

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  async getAllPages(@Req() req: RequestWithUser) {
    return this.pagesService.getAllPages(req.user.role);
  }

  @Public()
  @Get('public/:page')
  async getPublicPage(@Param('page') page: string) {
    return this.pagesService.getPageBySlug(page);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':page')
  async getPageForAdmin(@Param('page') page: string, @Req() req: RequestWithUser) {
    return this.pagesService.getPageForAdmin(page, req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put(':page')
  async updatePageContent(
    @Param('page') page: string,
    @Body() updateDto: UpdatePageContentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pagesService.createOrUpdatePageContent(page, updateDto, req.user.role);
  }

  // ========== FONDS D'ÉCRAN ==========

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('backgrounds/all')
  async getAllBackgrounds(@Req() req: RequestWithUser) {
    return this.pagesService.getAllBackgrounds(req.user.role);
  }

  @Public()
  @Get('backgrounds/:page')
  async getBackground(@Param('page') page: string) {
    return this.pagesService.getBackgroundByPage(page);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put('backgrounds/:page')
  async updateBackground(
    @Param('page') page: string,
    @Body() updateDto: UpdatePageBackgroundDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pagesService.createOrUpdateBackground(page, updateDto, req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('backgrounds/:id')
  async deleteBackground(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.pagesService.deleteBackground(id, req.user.role);
  }

  // ✅ ROUTES COMPATIBLES AVEC L'ANCIEN FORMAT /backgrounds
  @Public()
  @Get('backgrounds/page/:page')
  async getBackgroundByPageLegacy(@Param('page') page: string) {
    return this.pagesService.getBackgroundByPage(page);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('backgrounds')
  async createBackgroundLegacy(@Body() createDto: CreatePageBackgroundDto, @Req() req: RequestWithUser) {
    return this.pagesService.createOrUpdateBackground(createDto.page, createDto, req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('backgrounds/:id')
  async updateBackgroundLegacy(
    @Param('id') id: string, 
    @Body() updateDto: UpdatePageBackgroundDto, 
    @Req() req: RequestWithUser
  ) {
    // Récupérer d'abord le fond d'écran pour connaître sa page
    const backgrounds = await this.pagesService.getAllBackgrounds(req.user.role);
    const bg = backgrounds.find(b => b.id === id);
    if (bg) {
      return this.pagesService.createOrUpdateBackground(bg.page, updateDto, req.user.role);
    }
    throw new NotFoundException('Fond d\'écran non trouvé');
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post('initialize')
  async initializePages() {
    return this.pagesService.initializeDefaultPages();
  }
}