'use client';

import { createContext, useContext } from 'react';
import type { useNavigationState } from '../../lib/navigation-state.js';

export const AdminContext = createContext<
  (ReturnType<typeof useNavigationState> & { sidebarId: string }) | null
>(null);

export function useAdminNavigation() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('Admin navigation requires an AdminLayout.');
  return context;
}
