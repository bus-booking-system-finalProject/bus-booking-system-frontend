import {
  LayoutDashboard,
  Bus,
  Map,
  CalendarClock,
  BarChart3,
  UsersIcon,
  MapPin,
  Settings2,
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
    label: 'Stations',
    icon: MapPin,
    path: '/admin/stations',
  },
  {
    label: 'Bus Models',
    icon: Settings2,
    path: '/admin/bus-models',
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
    label: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: UsersIcon,
  },
];