import Cookies from 'js-cookie';

const TOKEN_KEY = 'administrator_access_token';
const REFRESH_TOKEN_KEY = 'administrator_refresh_token';

// Opsi cookie aman (disesuaikan dengan environment)
const cookieOptions: Cookies.CookieAttributes = {
  expires: 1, // 1 hari
  secure: window.location.protocol === 'https:', // hanya kirim lewat https jika di prod
  sameSite: 'strict',
};

const refreshCookieOptions: Cookies.CookieAttributes = {
  expires: 7, // 7 hari
  secure: window.location.protocol === 'https:',
  sameSite: 'strict',
};

export const setAccessToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, cookieOptions);
};

export const getAccessToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeAccessToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, refreshCookieOptions);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const clearAuthCookies = () => {
  removeAccessToken();
  removeRefreshToken();
  Cookies.remove('is_admin_logged_in');
};

export const setAdminLoggedIn = (status: boolean) => {
  if (status) {
    Cookies.set('is_admin_logged_in', 'true', cookieOptions);
  } else {
    Cookies.remove('is_admin_logged_in');
  }
};

export const isAdminLoggedIn = () => {
  return Cookies.get('is_admin_logged_in') === 'true';
};
