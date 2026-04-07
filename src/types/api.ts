export type Role = 'ADMIN' | 'USER';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'MOBILE_MONEY'
  | 'CASH_ON_DELIVERY';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  color?: string;
  size?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  price: number;
  stockQuantity: number;
  images: string[];
  categoryId?: string;
  categoryName?: string;
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  token?: string;
  user: AuthUser;
  isApiBacked: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
  stockQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CheckoutPayload {
  fullName: string;
  email: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface ProductPayload {
  title: string;
  description: string;
  brand: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  images: string[];
}

export interface OrderItem {
  id: string;
  productTitle: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt?: string;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
}
