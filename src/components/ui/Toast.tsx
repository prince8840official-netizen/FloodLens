import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { clsx } from 'clsx';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const t = { ...newToast, id, duration: newToast.duration ?? 5000 };
    setToasts(prev => [...prev, t]);
    return id;
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - (100 / (duration / 50));
        if (next <= 0) {
          clearInterval(interval);
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [toast.duration, toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-flood-success" />,
    error: <AlertCircle className="w-5 h-5 text-flood-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-flood-warning" />,
    info: <Info className="w-5 h-5 text-flood-primary" />,
  };

  const bgColors = {
    success: 'bg-flood-success/10 border-flood-success/30',
    error: 'bg-flood-danger/10 border-flood-danger/30',
    warning: 'bg-flood-warning/10 border-flood-warning/30',
    info: 'bg-flood-primary/10 border-flood-primary/30',
  };

  if (!visible) return null;

  return (
    <div 
      className={clsx('pointer-events-auto glass-strong rounded-lg border p-4 min-w-[300px] max-w-md shadow-xl animate-in slide-in', bgColors[toast.type])}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-flood-text">{toast.title}</p>
          {toast.message && <p className="text-sm text-flood-muted mt-1">{toast.message}</p>}
          {toast.action && (
            <button 
              onClick={() => { toast.action?.onClick(); onDismiss(toast.id); }}
              className="mt-2 text-sm font-medium text-flood-primary hover:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button 
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded text-flood-muted hover:text-flood-text hover:bg-flood-border transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-flood-primary/50 rounded-bl-lg rounded-br-lg" style={{ width: `${progress}%` }} />
    </div>
  );
}

export function showSuccess(title: string, message?: string, action?: Toast['action']) {
  return { type: 'success' as const, title, message, action };
}

export function showError(title: string, message?: string, action?: Toast['action']) {
  return { type: 'error' as const, title, message, action };
}

export function showWarning(title: string, message?: string, action?: Toast['action']) {
  return { type: 'warning' as const, title, message, action };
}

export function showInfo(title: string, message?: string, action?: Toast['action']) {
  return { type: 'info' as const, title, message, action };
}