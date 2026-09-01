import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 transition hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            ×
          </button>

        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto [scrollbar-gutter:stable] [overflow-anchor:none] p-6">

          {children}

        </div>

      </div>

    </div>

  );

}

export default Modal;
