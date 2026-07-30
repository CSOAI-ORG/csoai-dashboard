/**
 * Role-Based Access Control Middleware
 * Protects endpoints based on user roles
 */

import { TRPCError } from '@trpc/server';
import { getDb } from '../db.js';
import { users } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export enum UserRole {
  USER = 'user',
  REFERRAL_MANAGER = 'referral_manager',
  ADMIN = 'admin',
}

export interface UserWithRole {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
}

/**
 * Check if user has a specific role
 */
export async function checkUserRole(userId: number, requiredRole: UserRole): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return false;
    }

    const userRole = (user[0].role as string) || UserRole.USER;

    // Check role hierarchy
    if (requiredRole === UserRole.ADMIN) {
      return userRole === UserRole.ADMIN;
    } else if (requiredRole === UserRole.REFERRAL_MANAGER) {
      return userRole === UserRole.REFERRAL_MANAGER || userRole === UserRole.ADMIN;
    } else {
      return true; // USER role is available to everyone
    }
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Middleware to enforce role-based access
 */
export function requireRole(requiredRole: UserRole) {
  return async (userId: number): Promise<void> => {
    const hasRole = await checkUserRole(userId, requiredRole);

    if (!hasRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This action requires ${requiredRole} role`,
      });
    }
  };
}

/**
 * Get user with role information
 */
export async function getUserWithRole(userId: number): Promise<UserWithRole | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return null;
    }

    const userData = user[0];
    return {
      id: userData.id,
      email: userData.email || '',
      name: userData.name ?? undefined,
      role: (userData.role as UserRole) || UserRole.USER,
    };
  } catch (error) {
    console.error('Error getting user with role:', error);
    return null;
  }
}

/**
 * Check if user can manage referrals (manager or admin)
 */
export async function canManageReferrals(userId: number): Promise<boolean> {
  return checkUserRole(userId, UserRole.REFERRAL_MANAGER);
}

/**
 * Check if user can view team analytics (manager or admin)
 */
export async function canViewTeamAnalytics(userId: number): Promise<boolean> {
  return checkUserRole(userId, UserRole.REFERRAL_MANAGER);
}

/**
 * Check if user can approve commissions (manager or admin)
 */
export async function canApproveCommissions(userId: number): Promise<boolean> {
  return checkUserRole(userId, UserRole.REFERRAL_MANAGER);
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: number): Promise<boolean> {
  return checkUserRole(userId, UserRole.ADMIN);
}
