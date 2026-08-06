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

      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>

        </div>

        {/* Body */}
       <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">

          {children}

        </div>

      </div>

    </div>

  );

}

export default Modal;