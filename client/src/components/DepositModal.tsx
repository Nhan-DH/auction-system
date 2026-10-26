import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Wallet, CheckCircle, Plus } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, depositBalance } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(50000000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const presets = [
    { label: '+20 Triệu', value: 20000000 },
    { label: '+50 Triệu', value: 50000000 },
    { label: '+100 Triệu', value: 100000000 },
    { label: '+500 Triệu', value: 500000000 },
  ];

  const handleDeposit = async () => {
    const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) return;

    setLoading(true);
    await depositBalance(finalAmount);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Nạp Thêm Tiền Ví Ảo</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500">Số dư hiện tại:</p>
            <p className="text-base font-bold text-orange-600 font-mono">
              {currentUser.balance.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-white text-orange-600 font-semibold border border-orange-200">
            Khả dụng
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-700">Chọn số tiền nạp nhanh:</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setSelectedAmount(p.value);
                  setCustomAmount('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                  selectedAmount === p.value && !customAmount
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Hoặc nhập số tiền tùy ý (VNĐ):</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
              }}
              placeholder="ví dụ: 150000000"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono outline-none focus:border-orange-500"
            />
          </div>

          {success ? (
            <div className="flex items-center justify-center gap-2 py-2.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Nạp tiền thành công!</span>
            </div>
          ) : (
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Đang xử lý...' : 'Xác Nhận Nạp Ngay'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
