// frontend/src/hooks/usePermissions.ts

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';

// Hiérarchie des roles pour les vérifications de niveau
export const roleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.STAFF]: 60,
  [UserRole.MEMBER]: 40,
  [UserRole.VOLUNTEER]: 30,
  [UserRole.PARTNER]: 20,
  [UserRole.VISITOR]: 10,
};

export const usePermissions = () => {
  const { user } = useAuth();

  // Vérifications de base
  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isStaff = user?.role === UserRole.STAFF;
  const isMember = user?.role === UserRole.MEMBER;
  const isVolunteer = user?.role === UserRole.VOLUNTEER;
  const isPartner = user?.role === UserRole.PARTNER;
  const isVisitor = user?.role === UserRole.VISITOR;

  // Roles combinés (hiérarchie)
  const isAdminOrStaff = isAdmin || isStaff;
  const isSuperAdminOrAdmin = isSuperAdmin || isAdmin;
  const isStaffOrMember = isStaff || isMember;

  // Vérification par niveau (seuil)
  const hasLevel = (minLevel: number): boolean => {
    if (!user) return false;
    const userLevel = roleHierarchy[user.role] || 0;
    return userLevel >= minLevel;
  };

  // Vérification par rôle(s)
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Permissions par module

  // Utilisateurs
  const canManageUsers = isSuperAdminOrAdmin;
  const canCreateUser = isSuperAdminOrAdmin;
  const canEditUser = isSuperAdminOrAdmin;
  const canDeleteUser = isSuperAdmin;
  const canChangeUserRole = isSuperAdmin;

  // Projets
  const canManageProjects = isAdminOrStaff;
  const canCreateProject = isAdminOrStaff;
  const canEditProject = isAdminOrStaff;
  const canDeleteProject = isSuperAdminOrAdmin;
  const canViewProjects = true;

  // Beneficiaires
  const canManageBeneficiaries = isAdminOrStaff;
  const canCreateBeneficiary = isAdminOrStaff;
  const canEditBeneficiary = isAdminOrStaff;
  const canDeleteBeneficiary = isSuperAdminOrAdmin;
  const canViewBeneficiaries = isAuthenticated;

  // Dons
  const canManageDonations = isAdminOrStaff;
  const canViewDonations = isAuthenticated;
  const canExportDonations = isAdminOrStaff;

  // Benefices
  const canManageVolunteers = isAdminOrStaff;
  const canCreateVolunteer = isAdminOrStaff;
  const canEditVolunteer = isAdminOrStaff;

  // Blog
  const canManageBlog = isAdminOrStaff;
  const canCreatePost = isAdminOrStaff;
  const canEditPost = isAdminOrStaff;
  const canDeletePost = isSuperAdminOrAdmin;
  const canPublishPost = isAdminOrStaff;

  // Offres d'emploi
  const canManageJobs = isAdminOrStaff;
  const canCreateJobOffer = isAdminOrStaff;
  const canEditJobOffer = isAdminOrStaff;
  const canDeleteJobOffer = isSuperAdminOrAdmin;
  const canViewApplications = isAdminOrStaff;
  const canReviewApplications = isAdminOrStaff;

  // Evenements
  const canManageEvents = isAdminOrStaff;
  const canCreateEvent = isAdminOrStaff;
  const canEditEvent = isAdminOrStaff;
  const canDeleteEvent = isSuperAdminOrAdmin;

  // Audit
  const canViewAudit = isSuperAdmin;

  // Rapports
  const canGenerateReports = isAdminOrStaff;
  const canExportReports = isAdminOrStaff;

  // Partenaires
  const canManagePartners = isAdminOrStaff;
  const canCreatePartner = isAdminOrStaff;
  const canEditPartner = isAdminOrStaff;

  // Gestion du site
  const canManageSite = isAdminOrStaff;
  const canManagePages = isAdminOrStaff;
  const canManageBackgrounds = isAdminOrStaff;

  // Contacts
  const canManageContacts = isAdminOrStaff;

  // Medias
  const canManageMedia = isAdminOrStaff;

  return {
    user,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isStaff,
    isMember,
    isVolunteer,
    isPartner,
    isVisitor,
    isAdminOrStaff,
    isSuperAdminOrAdmin,
    isStaffOrMember,

    hasRole,
    hasLevel,

    canManageUsers,
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canChangeUserRole,

    canManageProjects,
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canViewProjects,

    canManageBeneficiaries,
    canCreateBeneficiary,
    canEditBeneficiary,
    canDeleteBeneficiary,
    canViewBeneficiaries,

    canManageDonations,
    canViewDonations,
    canExportDonations,

    canManageVolunteers,
    canCreateVolunteer,
    canEditVolunteer,

    canManageBlog,
    canCreatePost,
    canEditPost,
    canDeletePost,
    canPublishPost,

    canManageJobs,
    canCreateJobOffer,
    canEditJobOffer,
    canDeleteJobOffer,
    canViewApplications,
    canReviewApplications,

    canManageEvents,
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,

    canViewAudit,
    canGenerateReports,
    canExportReports,

    canManagePartners,
    canCreatePartner,
    canEditPartner,

    canManageSite,
    canManagePages,
    canManageBackgrounds,

    canManageContacts,
    canManageMedia,
  };
};