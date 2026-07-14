"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type ModalSize = "md" | "lg" | "xl";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: ModalSize;
  closeDisabled?: boolean;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    ),
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  size = "md",
  closeDisabled = false,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        if (!closeDisabled) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = getFocusableElements(panelRef.current);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeDisabled, onClose],
  );

  useEffect(() => {
    if (!open) return;

    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      if (!panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      const target = focusable[0] ?? panelRef.current;
      target.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      lastFocusedElementRef.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={closeDisabled || undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-700 dark:bg-[#101821]",
          SIZE_CLASSES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6 sm:py-5">
          <div className="min-w-0 space-y-1">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="text-sm leading-6 text-slate-600 dark:text-slate-400"
              >
                {description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Cerrar modal"
            className="shrink-0"
          >
            Cerrar
          </Button>
        </div>

        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/35 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
