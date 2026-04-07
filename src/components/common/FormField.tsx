import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface TextareaProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

export const FormField = (props: InputProps | TextareaProps) => {
  const { label, error, hint, suffix, as = 'input', className, ...rest } = props;

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <div className="field__control">
        {as === 'textarea' ? (
          <textarea
            className={cn('field__input field__input--textarea', error && 'field__input--error', className)}
            {...(rest as TextareaProps)}
          />
        ) : (
          <input
            className={cn('field__input', error && 'field__input--error', className)}
            {...(rest as InputProps)}
          />
        )}
        {suffix ? <span className="field__suffix">{suffix}</span> : null}
      </div>
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
};
