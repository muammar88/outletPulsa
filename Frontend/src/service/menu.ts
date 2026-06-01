import api from '@/service/api_administrator';

export interface TabMenu {
  id: number;
  submenu_id: number;
  name: string;
  icon: string;
  path: string;
  desc: string;
}

export interface SubMenu {
  id: number;
  menu_id: number;
  name: string;
  path: string;
  icon: string;
  tab: TabMenu[];
}

export interface Menu {
  id: number;
  name: string;
  path: string;
  icon: string;
  tab: TabMenu[];
  submenus: SubMenu[];
}

export interface MenuApiResponse {
  message: string;
  error: any | null;
  data?: {
    menus: Menu[];
  };
}

export const fetchMenuData = async (): Promise<Menu[]> => {
  const response = await api.get<MenuApiResponse>('/administrator/menu');
  
  if (response.data.error) {
    throw new Error(response.data.message || 'Gagal mengambil data menu dari server');
  }
  
  return response.data.data?.menus ?? [];
};
