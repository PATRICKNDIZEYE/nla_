import { IUser } from '@/@types/user.type';

// Get the effective role of a user considering their level and any temporary roles
export const getEffectiveRole = (user: IUser): string => {
  if (!user || !user.level) return 'user';
  return user.level.role || 'user';
};

// Check if a user can switch accounts based on their role
export const canSwitchAccount = (user: IUser): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin' || role === 'superadmin';
};

// Check if user has admin privileges
export const isAdmin = (user: IUser): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin' || role === 'superadmin';
};

// Check if user is a superadmin
export const isSuperAdmin = (user: IUser): boolean => {
  const role = getEffectiveRole(user);
  return role === 'superadmin';
};

// Get role hierarchy level (higher number means more privileges)
export const getRoleLevel = (role: string): number => {
  switch (role.toLowerCase()) {
    case 'superadmin':
      return 3;
    case 'admin':
      return 2;
    case 'moderator':
      return 1;
    default:
      return 0;
  }
};

// Check if user has sufficient role level
export const hasRoleLevel = (user: IUser, requiredRole: string): boolean => {
  const userRole = getEffectiveRole(user);
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}; 