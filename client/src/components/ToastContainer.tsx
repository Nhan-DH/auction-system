import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { AlertCircle, CheckCircle, Clock, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuction();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-18 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isUrgent = toast.type === 'urgent';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-lg border transition-all duration-300 bg-white ${
              isUrgent
                ? 'border-red-400 text-red-900 bg-red-50/95 ring-2 ring-red-400/30 animate-pulse'
                : toast.type === 'warning'
                ? 'border-orange-400 text-orange-900 bg-orange-50/95'
                : toast.type === 'success'
                ? 'border-emerald-400 text-emerald-900 bg-emerald-50/95'
                : toast.type === 'error'
                ? 'border-red-300 text-red-900 bg-red-50/95'
                : 'border-slate-300 text-slate-800 bg-white'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">
                {isUrgent ? (
                  <Clock className="w-4 h-4 text-red-600 animate-spin" />
                ) : toast.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                ) : toast.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Info className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
