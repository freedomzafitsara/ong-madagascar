// backend/src/modules/pages/dto/update-page-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreatePageContentDto } from './create-page-content.dto';

export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {}