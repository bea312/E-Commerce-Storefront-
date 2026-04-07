import axios from 'axios';
import type {
  AuthSession,
  AuthUser,
  Cart,
  CartItem,
  Category,
  CategoryPayload,
  CheckoutPayload,
  LoginPayload,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductPayload,
  ProductVariant,
  RegisterPayload,
  Role,
} from '../types/api';
import { storage } from './storage';

const api = axios.create({
  baseURL: 'https://e-commas-apis-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = storage.getAuth()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123',
};

const unwrap = <T,>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in (value as Record<string, unknown>)) {
    return unwrap<T>((value as Record<string, unknown>).data);
  }
  return value as T;
};

const arrayify = <T,>(value: unknown): T[] => {
  const data = unwrap<unknown>(value);
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object') {
    const candidate = data as Record<string, unknown>;
    if (Array.isArray(candidate.items)) {
      return candidate.items as T[];
    }
    if (Array.isArray(candidate.results)) {
      return candidate.results as T[];
    }
    if (Array.isArray(candidate.products)) {
      return candidate.products as T[];
    }
    if (Array.isArray(candidate.categories)) {
      return candidate.categories as T[];
    }
    if (Array.isArray(candidate.orders)) {
      return candidate.orders as T[];
    }
  }
  return [];
};

const record = (value: unknown): Record<string, unknown> => (value ?? {}) as Record<string, unknown>;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      const itemRecord = record(item);
      return String(itemRecord.url ?? itemRecord.secure_url ?? itemRecord.imageUrl ?? '');
    })
    .filter(Boolean);
};

const normalizeVariant = (value: unknown): ProductVariant => {
  const data = record(value);
  return {
    id: String(data.id ?? data._id ?? data.variantId ?? crypto.randomUUID()),
    name: String(data.name ?? data.title ?? data.color ?? data.size ?? 'Default option'),
    price: toNumber(data.price),
    stockQuantity: toNumber(data.stockQuantity ?? data.stock ?? data.quantity),
    sku: data.sku ? String(data.sku) : undefined,
    color: data.color ? String(data.color) : undefined,
    size: data.size ? String(data.size) : undefined,
  };
};

export const normalizeProduct = (value: unknown): Product => {
  const data = record(value);
  const variants = Array.isArray(data.variants)
    ? (data.variants as unknown[]).map(normalizeVariant)
    : [];
  const fallbackVariant = variants[0];
  const category = record(data.category);
  return {
    id: String(data.id ?? data._id ?? ''),
    title: String(data.title ?? data.name ?? 'Untitled product'),
    description: String(data.description ?? 'No description provided.'),
    brand: String(data.brand ?? 'Aurora'),
    price: toNumber(data.price ?? fallbackVariant?.price),
    stockQuantity: toNumber(data.stockQuantity ?? data.stock ?? fallbackVariant?.stockQuantity),
    images: toStringArray(data.images ?? data.files ?? data.gallery),
    categoryId: String(data.categoryId ?? category.id ?? category._id ?? ''),
    categoryName: String(category.name ?? data.categoryName ?? ''),
    variants,
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
};

const normalizeCategory = (value: unknown): Category => {
  const data = record(value);
  return {
    id: String(data.id ?? data._id ?? ''),
    name: String(data.name ?? data.title ?? 'Untitled category'),
    description: data.description ? String(data.description) : undefined,
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
};

const normalizeUser = (value: unknown, fallbackRole: Role = 'USER'): AuthUser => {
  const data = record(value);
  return {
    id: String(data.id ?? data._id ?? crypto.randomUUID()),
    name: String(data.name ?? data.fullName ?? 'Aurora customer'),
    email: String(data.email ?? ''),
    role: String(data.role ?? fallbackRole).toUpperCase() as Role,
  };
};

const normalizeCartItem = (value: unknown): CartItem => {
  const data = record(value);
  const product = record(data.product);
  const variant = record(data.variant);
  const quantity = toNumber(data.quantity ?? data.qty ?? 1);
  const price = toNumber(data.price ?? variant.price ?? product.price);
  return {
    id: String(data.id ?? data._id ?? data.itemId ?? crypto.randomUUID()),
    productId: String(data.productId ?? product.id ?? product._id ?? ''),
    variantId: data.variantId ? String(data.variantId) : variant.id ? String(variant.id) : undefined,
    productTitle: String(product.title ?? product.name ?? data.productTitle ?? 'Cart item'),
    image: String(
      toStringArray(product.images ?? product.files ?? data.images)[0] ??
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    ),
    price,
    quantity,
    subtotal: toNumber(data.subtotal ?? price * quantity),
    stockQuantity: toNumber(variant.stockQuantity ?? product.stockQuantity),
  };
};

const normalizeOrderItem = (value: unknown): OrderItem => {
  const data = record(value);
  const product = record(data.product);
  const quantity = toNumber(data.quantity);
  const price = toNumber(data.price ?? product.price);
  return {
    id: String(data.id ?? data._id ?? crypto.randomUUID()),
    productTitle: String(product.title ?? data.productTitle ?? 'Order item'),
    quantity,
    price,
    subtotal: toNumber(data.subtotal ?? price * quantity),
  };
};

const normalizeOrder = (value: unknown): Order => {
  const data = record(value);
  const user = record(data.user);
  return {
    id: String(data.id ?? data._id ?? ''),
    status: String(data.status ?? 'PENDING').toUpperCase() as OrderStatus,
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    totalAmount: toNumber(data.totalAmount ?? data.total ?? data.amount),
    customerName: user.name ? String(user.name) : undefined,
    customerEmail: user.email ? String(user.email) : undefined,
    items: Array.isArray(data.items) ? (data.items as unknown[]).map(normalizeOrderItem) : [],
  };
};

const normalizeCart = (value: unknown): Cart => {
  const data = record(unwrap(value));
  const items = arrayify<unknown>(data.items ?? data.cartItems ?? data).map(normalizeCartItem);
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

const extractToken = (value: unknown) => {
  const data = record(unwrap(value));
  return String(data.token ?? data.accessToken ?? data.access_token ?? '');
};

const extractUser = (value: unknown, fallbackRole: Role): AuthUser => {
  const data = record(unwrap(value));
  return normalizeUser(data.user ?? data.profile ?? data, fallbackRole);
};

const extractErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = record(error.response?.data);
    return String(responseData.message ?? responseData.error ?? error.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong.';
};

export const apiService = {
  extractErrorMessage,
  async login(payload: LoginPayload): Promise<AuthSession> {
    const isStaticAdmin =
      payload.email === ADMIN_CREDENTIALS.email && payload.password === ADMIN_CREDENTIALS.password;
    try {
      const response = await api.post('/api/auth/users/login', payload);
      const token = extractToken(response.data);
      const user = extractUser(response.data, isStaticAdmin ? 'ADMIN' : 'USER');
      return {
        token,
        user: { ...user, role: isStaticAdmin ? 'ADMIN' : user.role },
        isApiBacked: true,
      };
    } catch (error) {
      if (isStaticAdmin) {
        return {
          token: undefined,
          isApiBacked: false,
          user: {
            id: 'admin-local-session',
            name: 'Platform Administrator',
            email: ADMIN_CREDENTIALS.email,
            role: 'ADMIN',
          },
        };
      }
      throw new Error(extractErrorMessage(error));
    }
  },
  async register(payload: RegisterPayload) {
    await api.post('/api/auth/users/register', payload);
  },
  async getCurrentUser() {
    const response = await api.get('/api/auth/users/me');
    return extractUser(response.data, 'USER');
  },
  async getProducts() {
    const response = await api.get('/api/public/products');
    return arrayify<unknown>(response.data).map(normalizeProduct);
  },
  async getProduct(productId: string) {
    const response = await api.get(`/api/public/products/${productId}`);
    return normalizeProduct(unwrap(response.data));
  },
  async getProductsByCategory(categoryId: string) {
    const response = await api.get(`/api/public/products/category/${categoryId}`);
    return arrayify<unknown>(response.data).map(normalizeProduct);
  },
  async getCategories() {
    const response = await api.get('/api/categories');
    return arrayify<unknown>(response.data).map(normalizeCategory);
  },
  async createCategory(payload: CategoryPayload) {
    const response = await api.post('/api/categories', payload);
    return normalizeCategory(unwrap(response.data));
  },
  async updateCategory(categoryId: string, payload: CategoryPayload) {
    const response = await api.put(`/api/categories/${categoryId}`, payload);
    return normalizeCategory(unwrap(response.data));
  },
  async deleteCategory(categoryId: string) {
    await api.delete(`/api/categories/${categoryId}`);
  },
  async createProduct(payload: ProductPayload) {
    const response = await api.post('/api/admin/products', payload);
    return normalizeProduct(unwrap(response.data));
  },
  async updateProduct(productId: string, payload: ProductPayload) {
    const response = await api.patch(`/api/admin/products/${productId}`, payload);
    return normalizeProduct(unwrap(response.data));
  },
  async deleteProduct(productId: string) {
    await api.delete(`/api/admin/products/${productId}`);
  },
  async getCart() {
    const response = await api.get('/api/auth/cart');
    return normalizeCart(response.data);
  },
  async addCartItem(product: Product, quantity: number) {
    const variantId = product.variants[0]?.id;
    const payload: Record<string, unknown> = { quantity };
    if (variantId) {
      payload.variantId = variantId;
    }
    const response = await api.post('/api/auth/cart/items', payload);
    return normalizeCart(response.data);
  },
  async updateCartItem(itemId: string, quantity: number) {
    const response = await api.patch(`/api/auth/cart/items/${itemId}`, { quantity });
    return normalizeCart(response.data);
  },
  async removeCartItem(itemId: string) {
    const response = await api.delete(`/api/auth/cart/items/${itemId}`);
    return normalizeCart(response.data);
  },
  async clearCart() {
    const response = await api.delete('/api/auth/cart');
    return normalizeCart(response.data);
  },
  async checkout(payload: CheckoutPayload) {
    const response = await api.post('/api/auth/orders', payload);
    return normalizeOrder(unwrap(response.data));
  },
  async buyNow(product: Product, payload: CheckoutPayload) {
    const variantId = product.variants[0]?.id;
    const response = await api.post('/api/auth/orders/buy', {
      variantId,
      quantity: 1,
      ...payload,
    });
    return normalizeOrder(unwrap(response.data));
  },
  async getMyOrders() {
    const response = await api.get('/api/auth/orders');
    return arrayify<unknown>(response.data).map(normalizeOrder);
  },
  async getAllOrders() {
    const response = await api.get('/api/auth/orders/admin/all');
    return arrayify<unknown>(response.data).map(normalizeOrder);
  },
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const response = await api.patch(`/api/auth/orders/${orderId}/status`, { status });
    return normalizeOrder(unwrap(response.data));
  },
};
