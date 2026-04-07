import type { ReactNode } from 'react';

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="panel panel--centered">
    <div className="spinner" aria-hidden="true" />
    <p>{label}</p>
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="panel panel--centered empty-state">
    <p className="eyebrow">Nothing queued</p>
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
);
