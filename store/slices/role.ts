import { SystemRole, ROLE_PERMISSIONS, RolePermissions } from '@/types/roles'
import { persist } from 'zustand/middleware'

export interface RoleSlice {
  currentRole: SystemRole
  permissions: RolePermissions
  
  // Actions
  setRole: (role: SystemRole) => void
  hasPermission: (permission: keyof RolePermissions) => boolean
}

export const createRoleSlice = persist<RoleSlice>(
  (set, get) => ({
    currentRole: 'reception' as SystemRole, // Default to reception for demo
    permissions: ROLE_PERMISSIONS.reception,
    
    setRole: (role: SystemRole) => {
      set({
        currentRole: role,
        permissions: ROLE_PERMISSIONS[role]
      })
    },
    
    hasPermission: (permission: keyof RolePermissions) => {
      const state = get()
      return state.permissions[permission]
    }
  }),
  {
    name: 'role-storage', // unique name for localStorage key
    partialize: (state) => ({ 
      currentRole: state.currentRole 
    }), // only persist the role, permissions are derived
    onRehydrateStorage: () => (state) => {
      // After rehydration, ensure permissions are set correctly
      if (state && state.currentRole) {
        state.permissions = ROLE_PERMISSIONS[state.currentRole]
      }
    }
  }
)
