// backend/src/modules/auth/decorators/index.ts

//  Exporter explicitement pour éviter les conflits
export { 
  Roles, 
  ROLES_KEY, 
  AdminOnly, 
  SuperAdminOnly,
  CandidateOnly
} from './roles.decorator';

export { 
  Public, 
  IS_PUBLIC_KEY 
} from './public.decorator';

// Si vous avez un décorateur CurrentUser
// export { CurrentUser } from './current-user.decorator';