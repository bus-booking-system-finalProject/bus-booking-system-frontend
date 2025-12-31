import {
  LayoutDashboard,
  Bus,
  Building2,
  Map,
  CalendarClock,
  BarChart3,
  UsersIcon,
} from 'lucide-react';

export interface AdminTabItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

export const ADMIN_TABS: AdminTabItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    label: 'Operators',
    icon: Building2,
    path: '/admin/operators',
  },
  {
    label: 'Buses',
    icon: Bus,
    path: '/admin/buses',
  },
  {
    label: 'Routes',
    icon: Map,
    path: '/admin/routes',
  },
  {
    label: 'Trip Scheduling',
    icon: CalendarClock,
    path: '/admin/trips',
  },
  {
    label: 'Analytics', // <--- New Tab
    path: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Users', // --- NEW TAB ---
    path: '/admin/users',
    icon: UsersIcon,
  },
];
