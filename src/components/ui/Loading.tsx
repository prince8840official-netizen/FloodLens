import { clsx } from 'clsx';

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg className={clsx('animate-spin text-flood-primary', sizeClasses[size], className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function Skeleton({ className, variant = 'text', width, height, lines = 1 }: { 
  className?: string; 
  variant?: 'text' | 'circular' | 'rectangular'; 
  width?: string | number; 
  height?: string | number; 
  lines?: number;
}) {
  const baseStyle = { width, height };
  
  if (variant === 'circular') {
    return <div className={clsx('animate-pulse rounded-full bg-flood-border/30', className)} style={baseStyle} aria-hidden="true" />;
  }
  
  if (variant === 'rectangular') {
    return <div className={clsx('animate-pulse rounded-lg bg-flood-border/30', className)} style={baseStyle} aria-hidden="true" />;
  }
  
  return (
    <div className={clsx('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={clsx('animate-pulse h-4 rounded bg-flood-border/30', i === lines - 1 && 'w-3/4')} style={{ width: i === lines - 1 ? '75%' : '100%' }} />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('card animate-pulse', className)}>
      <div className="h-6 bg-flood-border/30 rounded w-3/4 mb-4" />
      <div className="h-8 bg-flood-border/30 rounded w-1/2 mb-2" />
      <div className="h-4 bg-flood-border/30 rounded w-full mb-2" />
      <div className="h-4 bg-flood-border/30 rounded w-5/6" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-flood-border/30 rounded w-full animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className="h-4 bg-flood-border/30 rounded w-full animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('relative rounded-xl overflow-hidden bg-flood-card border border-flood-border', className)} style={{ height: '400px' }} aria-hidden="true">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-flood-border/20 via-flood-border/30 to-flood-border/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-flood-muted">
          <Spinner size="lg" className="mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6 animate-pulse', className)}>
      <div className="h-8 bg-flood-border/30 rounded w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="h-96 bg-flood-border/30 rounded-xl" />
    </div>
  );
}