// backend/src/config/validation.config.ts

import { ValidationPipeOptions } from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,  // Permet les champs supplémentaires sans erreur
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  skipMissingProperties: false,
  validationError: {
    target: false,
    value: false,
  },
  errorHttpStatusCode: 400,
};