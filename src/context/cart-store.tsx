import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../lib/api';
import { storage } from '../lib/storage';
import type { Cart, Product } from '../types/api';
import { useAuth } from './auth-store';

interface CartContextValue {
  cart: Cart;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const emptyCart: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isUser } = useAuth();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: apiService.getCart,
    enabled: isAuthenticated && isUser,
    initialData: storage.getCart() ?? emptyCart,
  });

  useEffect(() => {
    storage.setCart(cartQuery.data ?? emptyCart);
  }, [cartQuery.data]);

  const syncQuery = (cart: Cart) => {
    queryClient.setQueryData(['cart'], cart);
    storage.setCart(cart);
  };

  const addMutation = useMutation({
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) =>
      apiService.addCartItem(product, quantity),
    onSuccess: (cart) => {
      syncQuery(cart);
      toast.success('Item added to cart.');
    },
    onError: (error) => toast.error(apiService.extractErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiService.updateCartItem(itemId, quantity),
    onSuccess: syncQuery,
    onError: (error) => toast.error(apiService.extractErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: apiService.removeCartItem,
    onSuccess: (cart) => {
      syncQuery(cart);
      toast.success('Item removed.');
    },
    onError: (error) => toast.error(apiService.extractErrorMessage(error)),
  });

  const clearMutation = useMutation({
    mutationFn: apiService.clearCart,
    onSuccess: (cart) => {
      syncQuery(cart);
      toast.success('Cart cleared.');
    },
    onError: (error) => toast.error(apiService.extractErrorMessage(error)),
  });

  const value = useMemo<CartContextValue>(
    () => ({
      cart: cartQuery.data ?? emptyCart,
      cartCount: cartQuery.data?.totalItems ?? 0,
      cartTotal: cartQuery.data?.totalAmount ?? 0,
      isLoading:
        cartQuery.isLoading ||
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        clearMutation.isPending,
      async addItem(product, quantity = 1) {
        await addMutation.mutateAsync({ product, quantity });
      },
      async updateItem(itemId, quantity) {
        await updateMutation.mutateAsync({ itemId, quantity });
      },
      async removeItem(itemId) {
        await removeMutation.mutateAsync(itemId);
      },
      async clearCart() {
        await clearMutation.mutateAsync();
      },
    }),
    [
      addMutation,
      cartQuery.data,
      cartQuery.isLoading,
      clearMutation,
      removeMutation,
      updateMutation,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartProvider;
