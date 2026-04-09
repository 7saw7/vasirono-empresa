"use client";

import * as React from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h3 className="text-lg font-semibold text-neutral-950">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            ) : null}
          </div>

          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}