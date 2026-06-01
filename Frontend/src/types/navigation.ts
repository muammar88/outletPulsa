import type { Tab } from './tab';

export interface SubMenu {
  id: number;
  name: string;
  path: string;
  icon: string;
  tab?: Tab[];
}

export interface Navigation {
  id: number;
  name: string;
  path: string;
  icon: string;
  tab?: Tab[];
  submenus?: SubMenu[];
}
