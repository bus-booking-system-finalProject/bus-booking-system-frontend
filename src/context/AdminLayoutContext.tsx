import React, { createContext, useContext } from 'react';
import type { AdminTabItem } from '@/config/adminTabs';

// 1. Define the Context Type
export interface AdminContextType {
  activeTab: AdminTabItem | undefined;
  pageTitle: string;
  PageIcon: React.ElementType | null;
}

// 2. Create the Context
export const AdminLayoutContext = createContext<AdminContextType | undefined>(undefined);

// 3. Custom Hook (Exported from here to satisfy ESLint)
export const useAdminPageInfo = () => {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error('useAdminPageInfo must be used within an AdminRootLayout');
  }
  return context;
};
