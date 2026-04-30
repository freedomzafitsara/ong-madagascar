'use client';

import { useAuth } from './useAuth';
import { UserRole } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || isAdmin;
  const isVolunteer = user?.role === 'volunteer';
  const isReader = user?.role === 'reader';
  
  const canManageUsers = isAdmin;
  const canManageProjects = isStaff;
  const canManageBeneficiaries = isStaff;
  const canManageDonations = isStaff;
  const canManageVolunteers = isStaff;
  const canManageBlog = isStaff;
  const canViewAudit = isAdmin;
  const canGenerateReports = isStaff;
  const canManageContacts = isStaff;
  const canManageMedia = isStaff;

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    isAdmin,
    isStaff,
    isVolunteer,
    isReader,
    canManageUsers,
    canManageProjects,
    canManageBeneficiaries,
    canManageDonations,
    canManageVolunteers,
    canManageBlog,
    canViewAudit,
    canGenerateReports,
    canManageContacts,
    canManageMedia,
    hasRole,
  };
};