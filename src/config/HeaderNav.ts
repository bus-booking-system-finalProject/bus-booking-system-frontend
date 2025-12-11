export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Tra cứu vé', path: '/tickets' },
  { label: 'Giới thiệu', path: '/introduction' },
  { label: 'Liên hệ', path: '/contacts' },
];
