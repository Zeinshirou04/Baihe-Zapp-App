"use client";
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-ink text-paper hover:bg-ink/90',
      secondary: 'bg-ink/10 text-ink hover:bg-ink/20 border border-ink/20',
      destructive: 'bg-plum text-paper hover:bg-plum/90',
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';