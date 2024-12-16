import { UserRole } from '@/types/user';

export const canEditCase = (
  status: string,
  userRole: UserRole,
  createdBy: string,
  currentUserId: string,
  caseDistrict?: string,
  userDistrict?: string
) => {
  // Super admin can edit any case
  if (userRole === 'superadmin') return true;

  // Cases under processing can only be edited by super admin
  if (status === 'processing') return false;

  // Creator can edit their rejected or open cases
  if (['rejected', 'open'].includes(status) && createdBy === currentUserId) return true;

  // District manager can edit cases in their district (except processing)
  if (userRole === 'manager' && 
      status !== 'processing' && 
      caseDistrict === userDistrict) return true;

  return false;
};

export const getEditableFields = (
  status: string,
  userRole: UserRole
): string[] => {
  // Define which fields can be edited based on status and role
  const allFields = ['title', 'description', 'attachments', 'location'];
  
  if (userRole === 'superadmin') return allFields;
  
  if (status === 'processing') return [];
  
  if (status === 'rejected') return ['attachments', 'description'];
  
  return allFields;
}; 