import clsx from 'clsx';

export const cn = (...values: Array<string | false | null | undefined>) => clsx(values);

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number) => currency.format(value || 0);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
