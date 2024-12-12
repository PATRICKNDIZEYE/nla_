import { IAuthRegister } from "@/@types/auth.type";

export const getEffectiveRole = (user?: IAuthRegister) => {
  if (!user?.level) return null;
  return user.level.isSwitch ? user.level.role : (user.level.accountRole || user.level.role);
};

export const shouldShowAdminContent = (user?: IAuthRegister) => {
  const effectiveRole = getEffectiveRole(user);
  return ["admin", "manager"].includes(effectiveRole as string) && !user?.level?.isSwitch;
};

export const canAccessContent = (user?: IAuthRegister, contentUserId?: string, level?: string) => {
  const effectiveRole = getEffectiveRole(user);
  
  // If user has switched to regular user, they can only see their own content
  if (user?.level?.isSwitch) {
    return contentUserId === user._id;
  }

  // Admin can see everything
  if (effectiveRole === "admin") return true;

  // Manager can see district level content
  if (effectiveRole === "manager") {
    return level === "district" && user?.level?.district;
  }

  // Regular users can only see their own content
  return contentUserId === user?._id;
}; 