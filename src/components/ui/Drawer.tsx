import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right', 
  size = 'md', 
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && closeOnEscape) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[32rem]',
    full: 'w-full max-w-2xl',
  };

  const positionClasses = position === 'left' ? 'left-0' : 'right-0';

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby={title ? 'drawer-title' : undefined}>
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div 
        ref={contentRef}
        tabIndex={-1}
        className={clsx('relative flex flex-col glass-strong h-full shadow-2xl animate-in', sizeClasses[size], positionClasses)}
        onClick={e => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-flood-border flex-shrink-0">
            <div>
              {title && <h2 id="drawer-title" className="text-lg font-semibold text-flood-text">{title}</h2>}
            </div>
            {showClose && (
              <button 
                onClick={onClose}
                className="p-1 rounded-lg text-flood-muted hover:text-flood-text hover:bg-flood-border transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(drawerContent, document.body);
}