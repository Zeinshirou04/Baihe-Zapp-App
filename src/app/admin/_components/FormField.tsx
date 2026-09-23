"use client";
import { InputHTMLAttributes, forwardRef } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helperText, required, className, children }, ref) => {
    return (
      <div ref={ref} className={`${className}`}>
        <label className="block text-sm font-medium text-ink mb-1">
          {label} {required && <span className="text-plum" aria-hidden="true">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-plum">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-ink/50">{helperText}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full rounded border bg-white px-3 py-2 text-ink placeholder-ink/40
          focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass
          transition-colors
          ${error ? 'border-plum focus:border-plum focus:ring-plum' : 'border-ink/20'}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';