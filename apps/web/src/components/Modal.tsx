"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-border-light bg-bg-card p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 id="modal-title" className="text-lg font-bold text-text">
          {title ?? "_"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
