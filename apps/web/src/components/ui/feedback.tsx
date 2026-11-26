'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface BannerState {
  readonly message: string;
  readonly onRetry?: () => void;
}

/** Banner de erro amigável com botão de tentar novamente (SPEC §4). */
export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  className,
}: {
  readonly message: string;
  readonly onRetry?: (() => void) | undefined;
  readonly onDismiss?: (() => void) | undefined;
  readonly className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-[10px] border border-danger/25 bg-danger/5 px-4 py-3 text-[13px] text-red-800',
        className,
      )}
    >
      <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-danger" aria-hidden />
      <p className="flex-1 leading-5">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-danger/30 bg-white px-2.5 py-1 text-[12px] font-medium text-red-700 hover:bg-danger/5"
        >
          Tentar novamente
        </button>
      ) : null}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Fechar aviso" className="text-red-700/70 hover:text-red-800">
          <X size={15} strokeWidth={2} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/** Toast de confirmação que some sozinho. */
export function Toast({ message, onClose }: { readonly message: string; readonly onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onClose();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-[10px] border border-line bg-ink px-4 py-3 text-[13px] font-medium text-white shadow-raised"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {message}
    </div>
  );
}
