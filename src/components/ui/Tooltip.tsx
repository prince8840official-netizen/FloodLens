import { useState, useRef, useEffect, type ReactElement, type RefObject, cloneElement, isValidElement } from 'react';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 200, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const childRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      setShow(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
    setTimeout(() => setShow(false), 150);
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const childWithRef = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      } as any)
    : children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-flood-card border-4 border-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-flood-card border-4 border-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-flood-card border-4 border-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-flood-card border-4 border-transparent',
  };

  if (!show) return <>{childWithRef}</>;

  const tooltip = (
    <div className={clsx('fixed z-[100] pointer-events-none', positions[position])} style={{ transformOrigin: 'center' }}>
      <div className={clsx('glass-strong px-2 py-1 rounded text-xs font-medium text-flood-text whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95', className)}>
        {content}
      </div>
      <div className={clsx('w-0 h-0', arrows[position])} />
    </div>
  );

  return (
    <>
      {childWithRef}
      {typeof window !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}