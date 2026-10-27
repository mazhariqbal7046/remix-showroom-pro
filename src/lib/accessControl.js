export const SUPER_ADMIN_EMAIL = 'mazhariqbal4016@gmail.com';

export const isSuperAdminUser = (user) =>
  user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL &&
  user?.app_metadata?.role === 'super_admin';
