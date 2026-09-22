"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, description, icon, onClose, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#10241c]/65 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto w-full max-w-xl rounded-3xl border border-[#eadfce] bg-[#fffdf8] text-[#1c1917] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-[#eadfce] px-5 py-5 text-center sm:px-6">
          <div className="mx-auto flex max-w-md flex-1 flex-col items-center">
            {icon ? <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-[#f4e4d4] text-[#c4531a]">{icon}</div> : null}
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-6 text-[#57534e]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#eadfce] text-[#44403c] hover:bg-[#f6f1e7]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-left">
      <span className="text-sm font-semibold text-[#292524]">{label}</span>
      {hint ? <span className="mt-0.5 block text-sm font-normal text-[#78716c]">{hint}</span> : null}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export const fieldClass =
  "h-12 w-full rounded-xl border border-[#e4d8c8] bg-white px-3 text-base text-[#1c1917] outline-none focus:border-[#c4531a] focus:ring-4 focus:ring-[#f6e1d2]";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-800">{message}</p>;
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-xl bg-[#c4531a] text-base font-semibold text-white hover:bg-[#a34312] disabled:cursor-not-allowed disabled:bg-[#a8a29e]"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
