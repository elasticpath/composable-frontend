"use client";
import React from "react";

export function ConfirmLocaleChangeModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-2">Change Language?</h2>
        <p className="text-sm text-gray-700 mb-4">
          Changing locale will <strong>empty your cart</strong>. Continue?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Yes, continue
          </button>
        </div>
      </div>
    </div>
  );
}
