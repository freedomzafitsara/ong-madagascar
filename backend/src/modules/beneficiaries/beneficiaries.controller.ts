import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,  // ← AJOUTE CETTE LIGNE !
} from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary } from '../../entities/beneficiary.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/roles.enum';

// DTO pour la création (documentation Swagger)
class CreateBeneficiaryDto {
  firstName: string;
  lastName: string;
  birthDate?: Date;
  gender?: string;
  email?: string;
  phone?: string;
  region?: string;
  commune?: string;
  fokontany?: string;
  educationLevel?: string;
  employmentStatus?: string;
  beforeYmAd?: string;
  afterYmAd?: string;
  userId?: string;
}

// DTO pour la mise à jour
class UpdateBeneficiaryDto {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: string;
  email?: string;
  phone?: string;
  region?: string;
  commune?: string;
  fokontany?: string;
  educationLevel?: string;
  employmentStatus?: string;
  beforeYmAd?: string;
  afterYmAd?: string;
  userId?: string;
}

@ApiTags('Beneficiaries')
@ApiBearerAuth()
@Controller('api/beneficiaries')
@UseGuards(RolesGuard)
export class BeneficiariesController {
  constructor(private readonly service: BeneficiariesService) {}

  // ============================================
  // GET /api/beneficiaries - Liste tous les bénéficiaires
  // ============================================
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @ApiOperation({ 
    summary: 'Liste tous les bénéficiaires',
    description: 'Retourne la liste complète des bénéficiaires avec leurs relations (user et projets). Réservé aux administrateurs et staff.'
  })
  @ApiOkResponse({ 
    description: 'Liste des bénéficiaires récupérée avec succès',
    type: [Beneficiary]
  })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  @ApiForbiddenResponse({ description: 'Droits insuffisants' })
  findAll(): Promise<Beneficiary[]> {
    return this.service.findAll();
  }

  // ============================================
  // GET /api/beneficiaries/stats/impact - Statistiques d'impact
  // ============================================
  @Get('stats/impact')
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @ApiOperation({ 
    summary: 'Statistiques d\'impact social',
    description: 'Retourne les indicateurs clés d\'impact : nombre total de bénéficiaires, taux d\'insertion professionnelle, etc. Essentiel pour les rapports aux bailleurs de fonds.'
  })
  @ApiOkResponse({ 
    description: 'Statistiques d\'impact calculées avec succès',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 150 },
        withBeforeAfter: { type: 'number', example: 120 },
        improved: { type: 'number', example: 85 },
        impactRate: { type: 'number', example: 71 }
      }
    }
  })
  getImpactStats() {
    return this.service.getImpactStats();
  }

  // ============================================
  // GET /api/beneficiaries/stats/region - Statistiques par région
  // ============================================
  @Get('stats/region')
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @ApiOperation({ 
    summary: 'Statistiques des bénéficiaires par région',
    description: 'Répartition géographique des bénéficiaires par région de Madagascar.'
  })
  @ApiOkResponse({ 
    description: 'Statistiques par région calculées avec succès',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          region: { type: 'string', example: 'Analamanga' },
          count: { type: 'number', example: 45 }
        }
      }
    }
  })
  getStatsByRegion() {
    return this.service.getStatsByRegion();
  }

  // ============================================
  // GET /api/beneficiaries/:id - Détail d'un bénéficiaire
  // ============================================
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @ApiOperation({ 
    summary: 'Récupère un bénéficiaire par son ID',
    description: 'Retourne les informations détaillées d\'un bénéficiaire spécifique.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID du bénéficiaire (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiOkResponse({ 
    description: 'Bénéficiaire trouvé avec succès',
    type: Beneficiary
  })
  @ApiNotFoundResponse({ description: 'Bénéficiaire non trouvé' })
  @ApiUnauthorizedResponse({ description: 'Non authentifié' })
  findOne(@Param('id') id: string): Promise<Beneficiary> {
    return this.service.findOne(id);
  }

  // ============================================
  // POST /api/beneficiaries - Créer un bénéficiaire
  // ============================================
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crée un nouveau bénéficiaire',
    description: 'Enregistre un nouveau jeune bénéficiaire dans la base de données. Les champs beforeYmAd et afterYmAd sont essentiels pour mesurer l\'impact.'
  })
  @ApiBody({ 
    type: CreateBeneficiaryDto,
    description: 'Données du bénéficiaire à créer',
    examples: {
      exemple1: {
        summary: 'Bénéficiaire standard',
        value: {
          firstName: 'Marie',
          lastName: 'Razafy',
          region: 'Analamanga',
          beforeYmAd: 'Sans emploi, vit chez ses parents',
          afterYmAd: 'Employée chez Telma'
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Bénéficiaire créé avec succès',
    type: Beneficiary
  })
  @ApiBadRequestResponse({ description: 'Données invalides' })
  create(@Body() data: Partial<Beneficiary>): Promise<Beneficiary> {
    return this.service.create(data);
  }

  // ============================================
  // PUT /api/beneficiaries/:id - Modifier un bénéficiaire
  // ============================================
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.STAFF)
  @ApiOperation({ 
    summary: 'Met à jour un bénéficiaire existant',
    description: 'Modifie les informations d\'un bénéficiaire. Tous les champs sont optionnels.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID du bénéficiaire à modifier',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ 
    type: UpdateBeneficiaryDto,
    description: 'Champs à mettre à jour'
  })
  @ApiOkResponse({ 
    description: 'Bénéficiaire mis à jour avec succès',
    type: Beneficiary
  })
  @ApiNotFoundResponse({ description: 'Bénéficiaire non trouvé' })
  update(
    @Param('id') id: string, 
    @Body() data: Partial<Beneficiary>
  ): Promise<Beneficiary> {
    return this.service.update(id, data);
  }

  // ============================================
  // DELETE /api/beneficiaries/:id - Supprimer un bénéficiaire
  // ============================================
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Supprime un bénéficiaire',
    description: 'Supprime définitivement un bénéficiaire de la base de données. Action réservée aux Super Admin uniquement.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID du bénéficiaire à supprimer',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiOkResponse({ description: 'Bénéficiaire supprimé avec succès' })
  @ApiNotFoundResponse({ description: 'Bénéficiaire non trouvé' })
  @ApiForbiddenResponse({ description: 'Réservé aux Super Admin' })
  delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}