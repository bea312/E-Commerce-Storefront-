import type { AuthSession, Cart } from '../types/api';

const AUTH_KEY = 'aurora-auth-session';
const CART_KEY = 'aurora-cart-snapshot';

export const storage = {
  getAuth(): AuthSession | null {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  },
  setAuth(session: AuthSession) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  },
  clearAuth() {
    window.localStorage.removeItem(AUTH_KEY);
  },
  getCart(): Cart | null {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as Cart) : null;
  },
  setCart(cart: Cart) {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },
  clearCart() {
    window.localStorage.removeItem(CART_KEY);
  },
};
