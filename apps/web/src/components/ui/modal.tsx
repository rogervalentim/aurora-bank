'use client';

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

/** Modal de auditoria com foco preso pela ordem do DOM e fechamento por Esc. */
export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 pt-[8vh] backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl rounded-[14px] border border-line bg-card shadow-raised"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="space-y-0.5">
            <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
            {description ? <p className="text-[13px] text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </button>
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
}
