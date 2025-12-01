/**
 * Module Permissions Configuration
 * Define permissions for each module in a centralized location
 * This makes it easy to add new modules and maintain consistency
 */

export interface ModuleConfig {
  name: string;
  actions: string[];
  descriptions?: Record<string, string>;
}

/**
 * Define all module permissions here
 * To add a new module:
 * 1. Add the module config below
 * 2. Run seed script to create permissions
 * 3. Assign permissions to roles as needed
 */
export const MODULE_PERMISSIONS: Record<string, ModuleConfig> = {
  user: {
    name: 'user',
    actions: ['create', 'read', 'update', 'delete'],
    descriptions: {
      create: 'Create new users',
      read: 'View user information',
      update: 'Update user information',
      delete: 'Delete users',
    },
  },
  product: {
    name: 'product',
    actions: ['create', 'read', 'update', 'delete'],
    descriptions: {
      create: 'Create new products',
      read: 'View product information',
      update: 'Update product information',
      delete: 'Delete products',
    },
  },
  order: {
    name: 'order',
    actions: ['create', 'read', 'update', 'cancel', 'fulfill'],
    descriptions: {
      create: 'Create new orders',
      read: 'View order information',
      update: 'Update order information',
      cancel: 'Cancel orders',
      fulfill: 'Fulfill orders',
    },
  },
  payment: {
    name: 'payment',
    actions: ['create', 'read', 'refund', 'verify'],
    descriptions: {
      create: 'Process payments',
      read: 'View payment information',
      refund: 'Process refunds',
      verify: 'Verify payments',
    },
  },
  report: {
    name: 'report',
    actions: ['read', 'export'],
    descriptions: {
      read: 'View reports',
      export: 'Export reports',
    },
  },
  settings: {
    name: 'settings',
    actions: ['read', 'update'],
    descriptions: {
      read: 'View system settings',
      update: 'Update system settings',
    },
  },
  permission: {
    name: 'permission',
    actions: ['create', 'read', 'update', 'delete', 'assign'],
    descriptions: {
      create: 'Create new permissions',
      read: 'View permissions',
      update: 'Update permissions',
      delete: 'Delete permissions',
      assign: 'Assign permissions to roles',
    },
  },
};

/**
 * Role Hierarchy:
 * - super_admin: Bypasses ALL permission checks, has access to everything
 * - admin: Has all permissions for all modules (permission-based)
 * - user: Limited permissions (permission-based)
 * - employee: Limited permissions (permission-based)
 */

/**
 * Role permission mappings
 * Define which permissions each role should have
 * Note: super_admin is not listed here as it bypasses all checks
 */
export const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  // Admin has all permissions for all modules (permission-based access)
  admin: [
    // All permissions for all modules
    ...Object.values(MODULE_PERMISSIONS).flatMap((module) =>
      module.actions.map((action) => ({
        resource: module.name,
        action,
      }))
    ),
  ],
  // Super Admin bypasses all checks, but we can still assign permissions for consistency
  super_admin: [
    // All permissions (though super_admin bypasses checks)
    ...Object.values(MODULE_PERMISSIONS).flatMap((module) =>
      module.actions.map((action) => ({
        resource: module.name,
        action,
      }))
    ),
  ],
  // User has basic read and create permissions
  user: [
    { resource: 'user', action: 'read' },
    { resource: 'product', action: 'read' },
    { resource: 'order', action: 'create' },
    { resource: 'order', action: 'read' },
    { resource: 'payment', action: 'create' },
    { resource: 'payment', action: 'read' },
  ],
  // Employee has read and limited update permissions
  employee: [
    { resource: 'user', action: 'read' },
    { resource: 'product', action: 'read' },
    { resource: 'product', action: 'update' },
    { resource: 'order', action: 'read' },
    { resource: 'order', action: 'update' },
    { resource: 'payment', action: 'read' },
    { resource: 'report', action: 'read' },
  ],
  // Moderator (kept for backward compatibility)
  moderator: [
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'update' },
    { resource: 'product', action: 'read' },
    { resource: 'product', action: 'update' },
    { resource: 'order', action: 'read' },
    { resource: 'order', action: 'update' },
    { resource: 'order', action: 'fulfill' },
    { resource: 'payment', action: 'read' },
    { resource: 'report', action: 'read' },
    { resource: 'settings', action: 'read' },
  ],
};

