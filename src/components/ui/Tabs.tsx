import { clsx } from 'clsx';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; count?: number; disabled?: boolean }[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default', className }: TabsProps) {
  const variantClasses = {
    default: 'border-flood-border',
    pills: '',
    underline: 'border-b border-flood-border',
  };

  const tabClasses = {
    default: 'px-4 py-2.5 text-sm font-medium rounded-lg border border-transparent hover:bg-flood-card/50 hover:border-flood-border transition-all',
    pills: 'px-4 py-2 text-sm font-medium rounded-lg hover:bg-flood-card/50 transition-all',
    underline: 'px-4 py-3 text-sm font-medium border-b-2 border-transparent -mb-px hover:text-flood-primary transition-all',
  };

  const activeClasses = {
    default: 'bg-flood-primary/10 border-flood-primary/30 text-flood-primary',
    pills: 'bg-flood-primary/10 text-flood-primary',
    underline: 'border-flood-primary text-flood-primary',
  };

  return (
    <div className={clsx('flex gap-1', variant === 'underline' && 'overflow-x-auto', className)} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={clsx(
            tabClasses[variant],
            activeTab === tab.id ? activeClasses[variant] : 'text-flood-muted',
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx('px-1.5 py-0.5 text-xs rounded-full', 
                activeTab === tab.id ? 'bg-flood-primary/20 text-flood-primary' : 'bg-flood-border text-flood-muted'
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

interface TabPanelsProps {
  tabs: { id: string }[];
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanels({ tabs, activeTab, children, className }: TabPanelsProps) {
  return (
    <div className={clsx('mt-4', className)}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className={activeTab === tab.id ? 'animate-in' : 'hidden'}
        >
          {typeof children === 'function' ? children(tab.id) : children}
        </div>
      ))}
    </div>
  );
}