// backend/src/modules/auth/enums/roles.enum.ts

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
  PARTNER = 'partner',
  VISITOR = 'visitor',  // ← Ajoute visitor si nécessaire
}