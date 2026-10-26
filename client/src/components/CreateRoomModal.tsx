import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { X, Plus, Trash2, Layers } from 'lucide-react';
import { AuctionItem } from '../types/auction';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'watch', name: 'Đồng hồ & Trang sức' },
  { id: 'art', name: 'Tranh ảnh & Mỹ thuật' },
  { id: 'antique', name: 'Cổ vật' },
  { id: 'tech', name: 'Thiết bị Công nghệ' },
  { id: 'vehicle', name: 'Xe cộ' },
  { id: 'luxury', name: 'Hàng xa xỉ' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547996160-71dfabb1a7cf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { createRoom } = useAuction();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('watch');
  const [autoStart, setAutoStart] = useState(true);

  // Initial Queue
  const [items, setItems] = useState<Partial<AuctionItem>[]>([
    {
      title: 'Đồng Hồ Rolex Submariner Date',
      description: 'Chính hãng Thụy Sĩ nguyên bản, hộp sổ bảo hành.',
      imageUrl: SAMPLE_IMAGES[0],
      startingPrice: 200000000,
      stepPrice: 5000000, // >= 10.000 đ
      buyNowPrice: 320000000,
      durationSeconds: 90,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: `Vật phẩm mới #${prev.length + 1}`,
        description: 'Mô tả thông tin vật phẩm...',
        imageUrl: SAMPLE_IMAGES[prev.length % SAMPLE_IMAGES.length],
        startingPrice: 50000000,
        stepPrice: 1000000,
        buyNowPrice: 80000000,
        durationSeconds: 90,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof AuctionItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createRoom({
      title: title.trim(),
      description: description.trim(),
      category,
      isPrivate: false,
      items,
      autoStart,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Tạo Phòng Đấu Giá Mới
            </h3>
            <p className="text-xs text-slate-500">
              Thiết lập phòng và thêm các vật phẩm vào hàng đợi bán
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên phòng đấu giá *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ví dụ: Phiên Đấu Giá Đồng Hồ Thụy Sĩ & Trang Sức"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chuyên mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả ngắn phòng
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt phiên đấu giá..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Items Queue Section */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <Layers className="w-4 h-4 text-orange-500" />
                Hàng Đợi Vật Phẩm ({items.length} vật phẩm)
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm vật phẩm vào hàng đợi</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                    <span className="text-xs font-bold text-orange-600">
                      Vật phẩm #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Xóa vật phẩm này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Tên vật phẩm:</label>
                      <input
                        type="text"
                        required
                        value={item.title || ''}
                        onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Link ảnh:</label>
                      <input
                        type="text"
                        value={item.imageUrl || ''}
                        onChange={(e) => handleUpdateItem(idx, 'imageUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Giá khởi điểm:</label>
                      <input
                        type="number"
                        min={10000}
                        required
                        value={item.startingPrice || 0}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'startingPrice', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Bước giá (≥10k):</label>
                      <input
                        type="number"
                        min={10000}
                        required
                        value={item.stepPrice || 10000}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'stepPrice', Math.max(10000, Number(e.target.value)))
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Giá Bán Ngay:</label>
                      <input
                        type="number"
                        value={item.buyNowPrice || 0}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'buyNowPrice', Number(e.target.value))
                        }
                        placeholder="0 nếu ko có"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Thời gian đấu:</label>
                      <select
                        value={item.durationSeconds || 90}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'durationSeconds', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                      >
                        <option value="60">60 giây</option>
                        <option value="90">90 giây</option>
                        <option value="120">120 giây</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Tạo Phòng Ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
