// backend/src/modules/auth/decorators/public.decorator.ts
// VERSION CORRECTE - À GARDER TEL QUEL

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);