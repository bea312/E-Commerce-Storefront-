import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import AdminRoute from '../components/routes/AdminRoute';
import UserRoute from '../components/routes/UserRoute';
import AuthProvider from '../context/auth-store';
import CartProvider from '../context/cart-store';
import { queryClient } from '../lib/queryClient';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminProductFormPage from '../pages/AdminProductFormPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import ProfilePage from '../pages/ProfilePage';

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products/:productId" element={<ProductDetailsPage />} />
              <Route element={<UserRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/product/new" element={<AdminProductFormPage />} />
                <Route path="/admin/product/:productId" element={<AdminProductFormPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);
