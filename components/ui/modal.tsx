import React from "react";

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ReusableModal: React.FC<ReusableModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all"
          >
            ✖
          </button>
        </div>
        <div className="text-sm text-gray-700">{children}</div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReusableModal;
