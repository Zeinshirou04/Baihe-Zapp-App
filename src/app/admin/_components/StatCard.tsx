"use client";
import Link from 'next/link';

interface ActionProps {
  label: string;
  href: string;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary';
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  href?: string;
  description?: string;
  action?: ActionProps;
}

export function StatCard({ label, value, icon, href, description, action }: StatCardProps) {
  const buttonClass = action?.variant === 'secondary'
    ? 'border border-ink/20 bg-white text-ink hover:bg-ink/5'
    : 'bg-ink text-paper hover:bg-ink/90';

  const content = (
    <div className="bg-white/60 border border-ink/10 rounded-md p-6 hover:border-brass/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <dt className="text-xs font-medium text-ink/50 uppercase tracking-wider">
          {label}
        </dt>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-brass/10 rounded-lg text-brass">
            {icon}
          </div>
        )}
      </div>
      <dd className="font-serif text-4xl font-semibold text-ink mt-2">
        {value}
      </dd>
      {description && (
        <p className="text-xs text-ink/50 mt-2">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          aria-label={action.ariaLabel ?? action.label}
          className={`inline-flex items-center gap-2 rounded-md mt-4 px-4 py-2 text-sm font-medium ${buttonClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass transition-colors`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-md"
      >
        {content}
      </Link>
    );
  }

  return content;
}