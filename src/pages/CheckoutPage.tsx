import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormField } from '../components/common/FormField';
import { useCart } from '../context/cart-store';
import { apiService } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { PaymentMethod } from '../types/api';

const shippingMethods = [
  { value: 'STANDARD_DELIVERY', label: 'Standard delivery', requiresPostalCode: true },
  { value: 'EXPRESS_DELIVERY', label: 'Express delivery', requiresPostalCode: true },
  { value: 'STORE_PICKUP', label: 'Store pickup', requiresPostalCode: false },
] as const;

const paymentMethods: PaymentMethod[] = [
  'CREDIT_CARD',
  'PAYPAL',
  'MOBILE_MONEY',
  'CASH_ON_DELIVERY',
];

const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required.'),
    email: z.string().email('Enter a valid email address.'),
    shippingAddress: z.string().trim().min(5, 'Shipping address is required.'),
    city: z.string().trim().min(2, 'City is required.'),
    shippingMethod: z.enum(['STANDARD_DELIVERY', 'EXPRESS_DELIVERY', 'STORE_PICKUP']),
    postalCode: z.string().optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
    paymentMethod: z.enum(paymentMethods),
    notes: z.string().optional(),
  })
  .superRefine((values, context) => {
    const shippingMethod = shippingMethods.find((item) => item.value === values.shippingMethod);
    if (shippingMethod?.requiresPostalCode && !values.postalCode?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: 'Postal code is required for the selected shipping method.',
      });
    }
  });

type CheckoutValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      shippingAddress: '',
      city: '',
      shippingMethod: 'STANDARD_DELIVERY',
      postalCode: '',
      phoneNumber: '',
      paymentMethod: 'CASH_ON_DELIVERY',
      notes: '',
    },
  });

  const shippingMethod = form.watch('shippingMethod');
  const reviewValues = form.watch();

  const checkoutMutation = useMutation({
    mutationFn: (values: CheckoutValues) =>
      apiService.checkout({
        fullName: values.fullName,
        email: values.email,
        shippingAddress: values.shippingAddress,
        city: values.city,
        postalCode: values.postalCode,
        phoneNumber: values.phoneNumber,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      }),
    onSuccess: async () => {
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully.');
      navigate('/profile');
    },
    onError: (error) => toast.error(apiService.extractErrorMessage(error)),
  });

  const steps = useMemo(
    () => [
      { id: 1, label: 'Shipping info' },
      { id: 2, label: 'Payment details' },
      { id: 3, label: 'Order review' },
    ],
    [],
  );

  const validateStep = async () => {
    if (step === 1) {
      const valid = await form.trigger([
        'fullName',
        'email',
        'shippingAddress',
        'city',
        'shippingMethod',
        'postalCode',
        'phoneNumber',
      ]);
      if (valid) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      const valid = await form.trigger(['paymentMethod', 'notes']);
      if (valid) {
        setStep(3);
      }
    }
  };

  return (
    <div className="page-stack">
      <section className="panel section-heading">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Complete your order in three steps</h1>
        </div>
        <div className="stepper">
          {steps.map((item) => (
            <span
              key={item.id}
              className={item.id === step ? 'stepper__item stepper__item--active' : 'stepper__item'}
            >
              {item.label}
            </span>
          ))}
        </div>
      </section>

      <div className="checkout-grid">
        <form className="panel form-grid" onSubmit={form.handleSubmit((values) => checkoutMutation.mutate(values))}>
          {step === 1 ? (
            <>
              <FormField label="Full name" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
              <FormField label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
              <FormField
                label="Shipping address"
                as="textarea"
                rows={4}
                {...form.register('shippingAddress')}
                error={form.formState.errors.shippingAddress?.message}
              />
              <FormField label="City" {...form.register('city')} error={form.formState.errors.city?.message} />
              <label className="field">
                <span className="field__label">Shipping method</span>
                <select className="select" {...form.register('shippingMethod')}>
                  {shippingMethods.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <FormField label="Postal code" {...form.register('postalCode')} error={form.formState.errors.postalCode?.message} />
              <FormField label="Phone number" {...form.register('phoneNumber')} error={form.formState.errors.phoneNumber?.message} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <label className="field">
                <span className="field__label">Payment method</span>
                <select className="select" {...form.register('paymentMethod')}>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <FormField
                label="Order notes"
                as="textarea"
                rows={5}
                {...form.register('notes')}
                hint="Optional delivery or payment instructions."
              />
              <div className="panel panel--subtle">
                <p className="eyebrow">Validation snapshot</p>
                <p>
                  {shippingMethod === 'STORE_PICKUP'
                    ? 'Postal code is optional for pickup.'
                    : 'Postal code is required for delivery.'}
                </p>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <div className="review-card">
              <div className="summary-row">
                <span>Customer</span>
                <strong>{reviewValues.fullName}</strong>
              </div>
              <div className="summary-row">
                <span>Email</span>
                <strong>{reviewValues.email}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <strong>{reviewValues.shippingMethod.replaceAll('_', ' ')}</strong>
              </div>
              <div className="summary-row">
                <span>Payment</span>
                <strong>{reviewValues.paymentMethod.replaceAll('_', ' ')}</strong>
              </div>
              <div className="summary-row">
                <span>Cart total</span>
                <strong>{formatCurrency(cart.totalAmount)}</strong>
              </div>
            </div>
          ) : null}

          <div className="form-actions">
            {step > 1 ? (
              <button className="button button--ghost" type="button" onClick={() => setStep((current) => current - 1)}>
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button className="button" type="button" onClick={validateStep}>
                Next step
              </button>
            ) : (
              <button className="button" type="submit" disabled={checkoutMutation.isPending || !cart.items.length}>
                Place order
              </button>
            )}
          </div>
        </form>

        <aside className="panel order-summary">
          <p className="eyebrow">Live summary</p>
          <div className="summary-row">
            <span>Items</span>
            <strong>{cart.totalItems}</strong>
          </div>
          <div className="summary-row">
            <span>Total due</span>
            <strong>{formatCurrency(cart.totalAmount)}</strong>
          </div>
          <div className="chip-row">
            {cart.items.map((item: (typeof cart.items)[number]) => (
              <span className="chip" key={item.id}>
                {item.productTitle} x {item.quantity}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
