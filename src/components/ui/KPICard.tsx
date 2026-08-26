import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  status?: 'normal' | 'warning' | 'critical' | 'success';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export function KPICard({ title, value, icon, trend, status = 'normal', onClick, loading, className }: KPICardProps) {
  const statusColors = {
    normal: 'text-flood-primary',
    warning: 'text-flood-warning',
    critical: 'text-flood-critical',
    success: 'text-flood-success',
  };

  const trendIcon = trend 
    ? trend.value > 0 
      ? <TrendingUp className="w-4 h-4 text-flood-success" /> 
      : trend.value < 0 
        ? <TrendingDown className="w-4 h-4 text-flood-danger" /> 
        : <Minus className="w-4 h-4 text-flood-muted" />
    : null;

  return (
    <div 
      className={clsx('kpi-card', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); onClick(); } }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-flood-muted truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-flood-border/30 animate-pulse rounded" />
            ) : (
              <span className={clsx('text-3xl font-bold tabular-nums', statusColors[status])}>{value}</span>
            )}
            {trend && trendIcon && (
              <span className="flex items-center gap-1 text-sm font-medium">
                {trendIcon}
                <span className={clsx(trend.value > 0 ? 'text-flood-success' : trend.value < 0 ? 'text-flood-danger' : 'text-flood-muted')}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-flood-muted">{trend.label}</span>
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-flood-primary/10 text-flood-primary">
            {icon}
          </div>
        )}
      </div>
      {status !== 'normal' && (
        <div className="mt-3 pt-3 border-t border-flood-border flex items-center gap-2 text-sm">
          <span className={clsx('w-2 h-2 rounded-full', 
            status === 'warning' && 'bg-flood-warning',
            status === 'critical' && 'bg-flood-critical animate-pulse',
            status === 'success' && 'bg-flood-success'
          )} />
          <span className={clsx('font-medium',
            status === 'warning' && 'text-flood-warning',
            status === 'critical' && 'text-flood-critical',
            status === 'success' && 'text-flood-success'
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}

interface KPIGridProps {
  cards: KPICardProps[];
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: number;
}

export function KPIGrid({ cards, columns = 4, gap = 4 }: KPIGridProps) {
  return (
    <div className={clsx('grid gap-4', { 'grid-cols-1': true, 'sm:grid-cols-2': columns >= 2, 'lg:grid-cols-3': columns >= 3, 'xl:grid-cols-4': columns >= 4, 'xl:grid-cols-5': columns >= 5 })}>
      {cards.map((card, i) => (
        <KPICard key={i} {...card} />
      ))}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: string;
}

export function MetricCard({ label, value, unit, trend, icon, color = '#06b6d4' }: MetricCardProps) {
  return (
    <div className="glass rounded-lg p-4 border border-flood-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-flood-muted uppercase tracking-wider">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-flood-text">{value}</span>
            {unit && <span className="text-sm text-flood-muted">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend.value > 0 ? (
                <svg className="w-3 h-3 text-flood-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
              ) : trend.value < 0 ? (
                <svg className="w-3 h-3 text-flood-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              ) : (
                <svg className="w-3 h-3 text-flood-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"/></svg>
              )}
              <span className={clsx(trend.value > 0 && 'text-flood-success', trend.value < 0 && 'text-flood-danger', trend.value === 0 && 'text-flood-muted')}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-flood-muted">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}><span style={{ color }}>{icon}</span></div>}
      </div>
    </div>
  );
}