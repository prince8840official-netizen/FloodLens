import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'high' | 'moderate' | 'normal' | 'success' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export function Badge({ className, variant = 'default', size = 'md', dot, children, ...props }: BadgeProps) {
  const variantClasses = {
    critical: 'badge-critical',
    high: 'badge-high',
    moderate: 'badge-moderate',
    normal: 'badge-normal',
    success: 'badge-success',
    info: 'badge-info',
    default: 'badge bg-flood-border text-flood-muted',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span className={clsx(variantClasses[variant], sizeClasses[size], className)} {...props}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-flood-critical': variant === 'critical',
        'bg-flood-danger': variant === 'high',
        'bg-flood-warning': variant === 'moderate',
        'bg-flood-primary': variant === 'normal' || variant === 'info',
        'bg-flood-success': variant === 'success',
        'bg-flood-muted': variant === 'default',
      })} />}
      {children}
    </span>
  );
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'critical' | 'high' | 'moderate' | 'normal' | 'resolved' | 'active' | 'enroute' | 'idle' | 'pending' | 'verified' | 'merged' | 'rejected' | 'responding' | 'maintenance' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md', className, ...props }: StatusBadgeProps) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string; dot: boolean }> = {
    critical: { variant: 'critical', label: 'CRITICAL', dot: true },
    high: { variant: 'high', label: 'HIGH', dot: true },
    moderate: { variant: 'moderate', label: 'MODERATE', dot: true },
    normal: { variant: 'normal', label: 'NORMAL', dot: true },
    resolved: { variant: 'success', label: 'RESOLVED', dot: true },
    active: { variant: 'info', label: 'ACTIVE', dot: true },
    enroute: { variant: 'moderate', label: 'EN ROUTE', dot: true },
    idle: { variant: 'success', label: 'AVAILABLE', dot: true },
    pending: { variant: 'moderate', label: 'PENDING', dot: true },
    verified: { variant: 'info', label: 'VERIFIED', dot: true },
    merged: { variant: 'success', label: 'MERGED', dot: true },
    rejected: { variant: 'critical', label: 'REJECTED', dot: true },
    responding: { variant: 'high', label: 'RESPONDING', dot: true },
    maintenance: { variant: 'warning', label: 'MAINTENANCE', dot: true },
    success: { variant: 'success', label: 'SUCCESS', dot: true },
  };
  
  const cfg = config[status] || config.normal;
  
  return <Badge variant={cfg.variant} size={size} dot={cfg.dot} className={className} {...props}>{cfg.label}</Badge>;
}

interface SeverityIndicatorProps {
  severity: 'critical' | 'high' | 'moderate' | 'normal' | 'resolved' | 'success';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityIndicator({ severity, showLabel = true, size = 'md' }: SeverityIndicatorProps) {
  const colors = {
    critical: 'bg-flood-critical',
    high: 'bg-flood-danger',
    moderate: 'bg-flood-warning',
    normal: 'bg-flood-primary',
    resolved: 'bg-flood-success',
    success: 'bg-flood-success',
  };
  
  const labels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    moderate: 'MODERATE',
    normal: 'NORMAL',
    resolved: 'RESOLVED',
    success: 'SUCCESS',
  };
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('rounded-full', colors[severity], sizeClasses[size], severity !== 'resolved' && severity !== 'normal' && 'animate-pulse')} />
      {showLabel && <span className="text-xs font-medium text-flood-text capitalize">{labels[severity].toLowerCase()}</span>}
    </div>
  );
}